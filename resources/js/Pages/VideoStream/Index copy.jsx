import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import AgoraRTC from 'agora-rtc-sdk-ng';

// AGORA_APP_ID and AGORA_TOKEN are passed as props.
// For production, AGORA_TOKEN should be fetched dynamically from your backend.
const Index = ({ auth, pageTitle, AGORA_APP_ID, AGORA_TOKEN }) => {
    // Modal States
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
    const [failureMessage, setFailureMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Agora Core States
    const agoraClient = useRef(null);
    const [uid, setUid] = useState(null);
    // const [channelName, setChannelName] = useState('live-demo-' + Math.random().toString(16).slice(2, 8));
    const [channelName, setChannelName] = useState('default-live-stream');
    const [role, setRole] = useState(null); // 'host' or 'audience'
    const [isJoined, setIsJoined] = useState(false);

    // Publishing States
    const [localTracks, setLocalTracks] = useState({ videoTrack: null, audioTrack: null });
    const [isPublishing, setIsPublishing] = useState(false); // True during the act of publishing
    const [hasPublished, setHasPublished] = useState(false); // True if publishing has ever succeeded in the current session

    // Device States
    const [availableDevices, setAvailableDevices] = useState({ cameras: [], mics: [] });
    const [selectedCamera, setSelectedCamera] = useState('');
    const [selectedMic, setSelectedMic] = useState('');

    // Remote Users State
    const [remoteUsers, setRemoteUsers] = useState({});

    // DOM Ref for Local Player
    const localPlayerRef = useRef(null);

    // --- 1. Initialization and Cleanup ---
    useEffect(() => {
        setUid(auth?.user?.id || Math.floor(Math.random() * 100000));

        if (!agoraClient.current) {
            agoraClient.current = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
            console.log("Agora client initialized. Version:", AgoraRTC.VERSION);
        }

        // Fetch devices without requesting permissions yet
        fetchInitialDevices();

        const clientToCleanUp = agoraClient.current;
        return () => {
            console.log("Component unmounting: Cleaning up all resources.");
            localTracks.videoTrack?.stop(); localTracks.videoTrack?.close();
            localTracks.audioTrack?.stop(); localTracks.audioTrack?.close();
            if (clientToCleanUp) {
                removeAgoraEvents(clientToCleanUp);
                if (isJoined) { // Ensure leave is called if joined
                    clientToCleanUp.leave().catch(e => console.error("Error leaving on unmount:", e));
                }
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    // --- 2. Device Management ---
    const fetchInitialDevices = async () => {
        console.log("Fetching initial list of devices (no permission prompt yet).");
        try {
            const devices = await AgoraRTC.getDevices(); // Does not prompt for permission
            const cameras = devices.filter(device => device.kind === 'videoinput');
            const mics = devices.filter(device => device.kind === 'audioinput');
            setAvailableDevices({ cameras, mics });
            if (cameras.length > 0 && !selectedCamera) setSelectedCamera(cameras[0].deviceId);
            if (mics.length > 0 && !selectedMic) setSelectedMic(mics[0].deviceId);
            console.log("Initial devices enumerated:", { cameras, mics });
        } catch (error) {
            console.error('Error enumerating initial devices:', error);
            setFailureMessage(`Error listing devices: ${error.message}`);
            // setIsFailureModalOpen(true); // Can be too verbose on load
        }
    };
    
    // Call this after permissions are granted (e.g., after successful publish) to update labels
    const refreshDeviceLabels = async () => {
        console.log("Refreshing device list to get labels (permissions should be granted).");
         try {
            const devices = await AgoraRTC.getDevices(true); // Pass true to try to get labels
            const cameras = devices.filter(device => device.kind === 'videoinput');
            const mics = devices.filter(device => device.kind === 'audioinput');
            setAvailableDevices({ cameras, mics });
            console.log("Device labels refreshed:", { cameras, mics });
        } catch (error) {
            console.error('Error refreshing device labels:', error);
        }
    };


    // --- 3. Agora Event Handlers ---
    const handleUserPublished = async (user, mediaType) => {
        console.log(`Remote user ${user.uid} published ${mediaType}`);
        try {
            await agoraClient.current.subscribe(user, mediaType);
            setRemoteUsers(prev => ({ ...prev, [user.uid]: user }));
            if (mediaType === 'video' && user.videoTrack) {
                setTimeout(() => {
                    const playerContainer = document.getElementById(`remote-player-${user.uid}`);
                    if (playerContainer) user.videoTrack.play(playerContainer);
                    else console.warn(`Remote player container for ${user.uid} not found.`);
                }, 0);
            }
            if (mediaType === 'audio' && user.audioTrack) user.audioTrack.play();
        } catch (e) { console.error(`Subscribe failed for ${user.uid}:`, e); }
    };
    const handleUserUnpublished = (user, mediaType) => {
        console.log(`Remote user ${user.uid} unpublished ${mediaType}`);
        // Logic to stop playback or update UI for this user
        setRemoteUsers(prev => {
            const updatedUser = prev[user.uid];
            if (updatedUser) {
                if (mediaType === 'video') updatedUser.videoTrack = null; // Or stop and remove
                if (mediaType === 'audio') updatedUser.audioTrack = null;
                return { ...prev, [user.uid]: updatedUser };
            }
            return prev;
        });
    };
    const handleUserLeft = (user) => {
        console.log(`Remote user ${user.uid} left`);
        setRemoteUsers(prev => {
            const newUsers = { ...prev };
            delete newUsers[user.uid];
            return newUsers;
        });
    };
    const setupAgoraEvents = (client) => {
        if (!client) return;
        removeAgoraEvents(client);
        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-left', handleUserLeft);
        console.log("Agora event listeners attached.");
    };
    const removeAgoraEvents = (client) => {
        if (!client) return;
        client.off('user-published', handleUserPublished);
        client.off('user-unpublished', handleUserUnpublished);
        client.off('user-left', handleUserLeft);
        console.log("Agora event listeners removed.");
    };

    // --- 4. Core Actions: Join, Publish, Leave ---
    const joinChannel = async (selectedRole) => {
        if (!channelName.trim()) { setFailureMessage("Channel name is required."); setIsFailureModalOpen(true); return; }
        if (!AGORA_APP_ID || AGORA_APP_ID === 'YOUR_AGORA_APP_ID') { setFailureMessage("Agora App ID not configured."); setIsFailureModalOpen(true); return; }
        if (!agoraClient.current) { setFailureMessage("Agora client not ready."); setIsFailureModalOpen(true); return; }

        console.log(`Joining channel "${channelName}" as ${selectedRole} (UID: ${uid}). Client state: ${agoraClient.current.connectionState}`);
        await handleLeave(false); // Gracefully leave previous channel if any, without showing modal

        try {
            setupAgoraEvents(agoraClient.current);
            await agoraClient.current.setClientRole(selectedRole);
            // For production, fetch AGORA_TOKEN from your backend securely before join
            await agoraClient.current.join(AGORA_APP_ID, channelName, AGORA_TOKEN, uid);
            console.log(`Joined channel successfully. Client state: ${agoraClient.current.connectionState}`);
            setRole(selectedRole);
            setIsJoined(true);
            setSuccessMessage(`Joined as ${selectedRole}.`);
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error('Failed to join channel:', error);
            setFailureMessage(`Join Error: ${error.message} (Code: ${error.code})`);
            setIsFailureModalOpen(true);
            setIsJoined(false); setRole(null);
        }
    };

    // This useEffect triggers publishTracks when conditions are met
    useEffect(() => {
        const playerDiv = localPlayerRef.current;
        const canPublish = isJoined && role === 'host' && !isPublishing && !hasPublished && playerDiv && playerDiv.offsetParent !== null;
        if (canPublish) {
            console.log("useEffect: Conditions met for publishing. Client state:", agoraClient.current?.connectionState);
            publishTracks();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isJoined, role, isPublishing, hasPublished, localPlayerRef.current]);

    const publishTracks = async () => {
        if (!agoraClient.current || agoraClient.current.connectionState !== 'CONNECTED') {
            console.warn(`Publish: Not connected. State: ${agoraClient.current?.connectionState}`);
            setIsPublishing(false); return; // Ensure isPublishing is reset
        }
        if (isPublishing) { console.log("Publish: Already in progress."); return; }

        console.log("Publishing local tracks...");
        setIsPublishing(true);
        let audioTrackToPublish = null, videoTrackToPublish = null;

        try {
            // This is where permissions will be requested if not already granted
            const audioConfig = selectedMic ? { microphoneId: selectedMic } : {};
            const videoConfig = selectedCamera ? { cameraId: selectedCamera, encoderConfig: "480p_1" } : { encoderConfig: "480p_1" };
            console.log("Creating tracks with config:", { audioConfig, videoConfig });
            
            [audioTrackToPublish, videoTrackToPublish] = await AgoraRTC.createMicrophoneAndCameraTracks(audioConfig, videoConfig);
            console.log("Local tracks created:", { video: videoTrackToPublish, audio: audioTrackToPublish });
            setLocalTracks({ audioTrack: audioTrackToPublish, videoTrack: videoTrackToPublish });

            if (videoTrackToPublish && localPlayerRef.current) {
                console.log("Playing local video track in ref:", localPlayerRef.current);
                videoTrackToPublish.play(localPlayerRef.current);
            } else {
                 if (!videoTrackToPublish) console.warn("Video track not created, cannot play.");
                 if (!localPlayerRef.current) console.warn("Local player ref not available for playback.");
            }

            await agoraClient.current.publish([audioTrackToPublish, videoTrackToPublish].filter(Boolean));
            console.log("Tracks published successfully.");
            
            setHasPublished(true);
            setSuccessMessage("Stream is live!");
            // setIsSuccessModalOpen(true); // Optional, can be chatty
            refreshDeviceLabels(); // Now that permissions are granted, refresh labels

        } catch (error) {
            console.error('Create/Publish Tracks Error:', error);
            setFailureMessage(`Stream Error: ${error.name} - ${error.message} (Code: ${error.code})`);
            setIsFailureModalOpen(true);
            audioTrackToPublish?.close(); // Clean up created tracks
            videoTrackToPublish?.close();
            setLocalTracks({ videoTrack: null, audioTrack: null });
            setHasPublished(false);
        } finally {
            setIsPublishing(false); // Publishing attempt is over
        }
    };

    const unpublishAndCleanLocalTracks = async (isLeavingChannel = false) => {
        console.log("Cleaning local tracks. Is leaving channel:", isLeavingChannel);
        if (agoraClient.current && (localTracks.audioTrack || localTracks.videoTrack) && agoraClient.current.connectionState === 'CONNECTED') {
            const tracksToUnpublish = [localTracks.audioTrack, localTracks.videoTrack].filter(Boolean);
            if (tracksToUnpublish.length > 0) {
                try {
                    await agoraClient.current.unpublish(tracksToUnpublish);
                    console.log("Tracks unpublished from Agora.");
                } catch (e) { console.warn("Unpublish error (might be ok if leaving):", e); }
            }
        }
        localTracks.videoTrack?.stop(); localTracks.videoTrack?.close();
        localTracks.audioTrack?.stop(); localTracks.audioTrack?.close();
        setLocalTracks({ videoTrack: null, audioTrack: null });
        if (localPlayerRef.current) localPlayerRef.current.innerHTML = ''; // Clear player

        if (!isLeavingChannel) { // Only reset these if not part of a full leave operation
             setIsPublishing(false);
             setHasPublished(false);
        }
        console.log("Local tracks cleaned.");
    };

    const handleLeave = async (showSuccessModal = true) => {
        console.log("Leaving channel...");
        await unpublishAndCleanLocalTracks(true); // Pass true as we are leaving

        if (agoraClient.current && agoraClient.current.connectionState !== 'DISCONNECTED') {
            try {
                await agoraClient.current.leave();
                console.log("Left Agora channel. Client state:", agoraClient.current.connectionState);
            } catch (e) { console.error("Error leaving channel:", e); }
        }
        setIsJoined(false); setRemoteUsers({}); setRole(null);
        setIsPublishing(false); setHasPublished(false); // Ensure these are reset fully
        if (showSuccessModal) {
            setSuccessMessage("Successfully left the channel.");
            setIsSuccessModalOpen(true);
        }
    };

    // --- 5. Media Control Toggles ---
    const toggleTrackEnabled = async (trackType) => {
        const track = localTracks[trackType];
        if (!track || !hasPublished) return; // Only if published and track exists
        try {
            await track.setEnabled(!track.enabled);
            setLocalTracks(prev => ({ ...prev })); // Trigger re-render for button text
            console.log(`${trackType} ${track.enabled ? 'enabled' : 'disabled'}`);
        } catch (e) { console.error(`Error toggling ${trackType}:`, e); }
    };

    const switchCamera = async () => {
        if (!localTracks.videoTrack || !hasPublished || availableDevices.cameras.length < 2) {
            console.warn("Switch camera: Conditions not met."); return;
        }
        try {
            const otherCameras = availableDevices.cameras.filter(cam => cam.deviceId !== selectedCamera);
            if (otherCameras.length === 0) { setFailureMessage("No other camera available."); setIsFailureModalOpen(true); return; }
            const newCameraId = otherCameras[0].deviceId;
            await localTracks.videoTrack.setDevice(newCameraId);
            setSelectedCamera(newCameraId);
            setSuccessMessage("Camera switched."); setIsSuccessModalOpen(true);
        } catch (e) {
            console.error('Error switching camera:', e);
            setFailureMessage(`Switch Camera Error: ${e.message}`); setIsFailureModalOpen(true);
        }
    };

    // --- 6. JSX Rendering ---
    // Define button styles (you can use Tailwind @apply or global CSS)
    const btnBase = "font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-150";
    const btnPrimary = `${btnBase} bg-blue-500 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`;
    const btnSecondary = `${btnBase} bg-gray-500 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`;
    const btnDanger = `${btnBase} bg-red-500 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`;
    const btnSuccess = `${btnBase} bg-green-500 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`;
    const btnWarning = `${btnBase} bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-50 disabled:cursor-not-allowed`;

    return (
        <>
            <Head title={pageTitle} />
            <AuthenticatedLayout user={auth} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{pageTitle}</h2>}>
                <div className="container mx-auto p-4 space-y-6">
                    {/* Setup and Connection Controls */}
                    <div className="p-4 bg-white shadow-lg rounded-lg">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Stream Setup</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="channelName" className="block text-sm font-medium text-gray-700">Channel Name</label>
                                <input type="text" id="channelName" value={channelName}
                                    onChange={(e) => setChannelName(e.target.value)}
                                    className="mt-1 input-form" disabled={isJoined} />
                            </div>

                            {!isJoined && (
                                <>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="cameraSelect" className="block text-sm font-medium text-gray-700">Camera</label>
                                            <select id="cameraSelect" value={selectedCamera} onChange={(e) => setSelectedCamera(e.target.value)}
                                                className="mt-1 input-form" disabled={availableDevices.cameras.length === 0}>
                                                {availableDevices.cameras.length === 0 && <option value="">No cameras found</option>}
                                                {availableDevices.cameras.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Cam ${d.deviceId.slice(0,6)}`}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="micSelect" className="block text-sm font-medium text-gray-700">Microphone</label>
                                            <select id="micSelect" value={selectedMic} onChange={(e) => setSelectedMic(e.target.value)}
                                                className="mt-1 input-form" disabled={availableDevices.mics.length === 0}>
                                                {availableDevices.mics.length === 0 && <option value="">No microphones found</option>}
                                                {availableDevices.mics.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0,6)}`}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <button onClick={() => joinChannel('host')} className={btnSuccess} disabled={!uid || !agoraClient.current}>Start Stream (Host)</button>
                                        <button onClick={() => joinChannel('audience')} className={btnPrimary} disabled={!uid || !agoraClient.current}>Join as Viewer</button>
                                        <button onClick={fetchInitialDevices} className={btnSecondary}>Refresh Devices</button>
                                    </div>
                                </>
                            )}

                            {isJoined && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <button onClick={() => handleLeave()} className={btnDanger}>Leave Stream</button>
                                    {role === 'host' && !hasPublished && !isPublishing && (
                                        <button onClick={publishTracks} className={btnWarning}>Go Live / Retry</button>
                                    )}
                                    {role === 'host' && hasPublished && localTracks.videoTrack && (
                                        <button onClick={() => toggleTrackEnabled('videoTrack')} className={btnSecondary}>
                                            {localTracks.videoTrack?.enabled ? 'Turn Camera Off' : 'Turn Camera On'}
                                        </button>
                                    )}
                                    {role === 'host' && hasPublished && localTracks.audioTrack && (
                                        <button onClick={() => toggleTrackEnabled('audioTrack')} className={btnSecondary}>
                                            {localTracks.audioTrack?.enabled ? 'Mute Mic' : 'Unmute Mic'}
                                        </button>
                                    )}
                                    {role === 'host' && hasPublished && localTracks.videoTrack && availableDevices.cameras.length > 1 && (
                                        <button onClick={switchCamera} className={btnSecondary}>Switch Camera</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Video Display Area */}
                    {isJoined && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Local Video (Host only) */}
                            {role === 'host' && (
                                <div className="bg-gray-800 p-3 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-white mb-2">Your Preview (UID: {uid})</h4>
                                    <div ref={localPlayerRef} className="w-full aspect-video bg-black flex items-center justify-center text-gray-400 rounded overflow-hidden">
                                        {isPublishing && !hasPublished && <p>Starting camera...</p>}
                                        {!isPublishing && !hasPublished && <p>Click "Go Live" to start your camera.</p>}
                                        {hasPublished && !localTracks.videoTrack && <p>Camera is off or there was an issue.</p>}
                                    </div>
                                </div>
                            )}

                            {/* Remote Videos */}
                            <div className={role === 'host' ? "md:col-span-1" : "md:col-span-2"}>
                                <h4 className="text-xl font-semibold mb-2 text-gray-700">{role === 'host' ? 'Viewers' : 'Live Stream'}</h4>
                                {Object.values(remoteUsers).filter(u => u.videoTrack).length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        {role === 'host' ? "Waiting for viewers to join..." : "Host has not started video or no one is streaming."}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Object.values(remoteUsers).map(user => (
                                            user.videoTrack && user.uid && (
                                                <div key={user.uid} className="bg-gray-700 p-2 rounded-lg shadow">
                                                    <p className="text-sm text-white mb-1">Viewer: {user.uid}</p>
                                                    <div id={`remote-player-${user.uid}`} className="w-full aspect-video bg-black rounded overflow-hidden"></div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Debug Info Panel (Development Only) */}
                    {/* Debug Info (Only in Development) */}
                    {import.meta.env.DEV && (
                        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg text-xs shadow">
                            <h4 className="text-sm font-bold mb-2 text-gray-700 border-b border-gray-300 pb-1">Debug Information Panel</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                                <p><strong>UID:</strong> {uid}</p>
                                <p><strong>Channel:</strong> {channelName}</p>
                                <p><strong>Role:</strong> {role || 'N/A'}</p>
                                <p><strong>Joined:</strong> <span className={isJoined ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{isJoined.toString()}</span></p>
                                <p><strong>Client State:</strong> {agoraClient.current?.connectionState || 'N/A'}</p>
                                <p><strong>Publishing:</strong> <span className={isPublishing ? 'text-blue-600 font-semibold' : 'font-semibold'}>{isPublishing.toString()}</span></p>
                                <p><strong>Has Published:</strong> <span className={hasPublished ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{hasPublished.toString()}</span></p>
                                
                                <div className="col-span-full mt-1 pt-1 border-t border-gray-300">
                                    <p className="font-semibold">Local Tracks:</p>
                                    <p className="ml-2">Video: {localTracks.videoTrack ? `ID: ${localTracks.videoTrack.getTrackId().slice(0,10)}..., Enabled: ${localTracks.videoTrack.enabled}` : 'null'}</p>
                                    <p className="ml-2">Audio: {localTracks.audioTrack ? `ID: ${localTracks.audioTrack.getTrackId().slice(0,10)}..., Enabled: ${localTracks.audioTrack.enabled}` : 'null'}</p>
                                </div>

                                <div className="col-span-full mt-1 pt-1 border-t border-gray-300">
                                    <p className="font-semibold">Selected Devices:</p>
                                    <p className="ml-2">Camera: {selectedCamera ? `${selectedCamera.slice(0,10)}...` : 'None'}</p>
                                    <p className="ml-2">Mic: {selectedMic ? `${selectedMic.slice(0,10)}...` : 'None'}</p>
                                </div>
                                
                                <div className="col-span-full mt-1 pt-1 border-t border-gray-300">
                                    <p className="font-semibold">Available Devices:</p>
                                    <p className="ml-2">Cameras ({availableDevices.cameras.length}): {availableDevices.cameras.map(c => (c.label || `Cam ${c.deviceId.slice(0,6)}`)).join(', ') || 'None'}</p>
                                    <p className="ml-2">Mics ({availableDevices.mics.length}): {availableDevices.mics.map(m => (m.label || `Mic ${m.deviceId.slice(0,6)}`)).join(', ') || 'None'}</p>
                                </div>

                                <p className="col-span-full mt-1 pt-1 border-t border-gray-300"><strong>Remote Users:</strong> {Object.keys(remoteUsers).length}</p>
                            </div>
                            <button
                                onClick={() => console.log("AGORA CLIENT INSTANCE:", agoraClient.current, "LOCAL TRACKS:", localTracks, "REMOTE USERS:", remoteUsers)}
                                className="mt-3 text-xs py-1 px-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                            >
                                Log Full State to Console
                            </button>
                        </div>
                    )}
                    {/* Success Modal */}
                    {isSuccessModalOpen && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
                            onClick={() => setIsSuccessModalOpen(false)} // Optional: close on backdrop click
                        >
                            <div
                                className="relative w-auto max-w-md mx-auto my-6"
                                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
                            >
                                {/*content*/}
                                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                    {/*header*/}
                                    <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
                                        <h3 className="text-2xl font-semibold text-green-600">
                                            Success!
                                        </h3>
                                        <button
                                            className="p-1 ml-auto bg-transparent border-0 text-black opacity-70 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                            onClick={() => setIsSuccessModalOpen(false)}
                                        >
                                            <span className="bg-transparent text-black h-6 w-6 text-2xl block outline-none focus:outline-none">
                                                ×
                                            </span>
                                        </button>
                                    </div>
                                    {/*body*/}
                                    <div className="relative p-6 flex-auto">
                                        <p className="my-4 text-gray-600 text-lg leading-relaxed">
                                            {successMessage}
                                        </p>
                                    </div>
                                    {/*footer*/}
                                    <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b">
                                        <button
                                            className="bg-green-500 text-white hover:bg-green-600 active:bg-green-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                            type="button"
                                            onClick={() => setIsSuccessModalOpen(false)}
                                        >
                                            OK
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Backdrop for Success Modal (Optional, creates the dimming effect) */}
                    {isSuccessModalOpen && <div className="fixed inset-0 z-40 bg-black opacity-25"></div>}


                    {/* Failure Modal */}
                    {isFailureModalOpen && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
                            onClick={() => setIsFailureModalOpen(false)} // Optional: close on backdrop click
                        >
                            <div
                                className="relative w-auto max-w-md mx-auto my-6"
                                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
                            >
                                {/*content*/}
                                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                    {/*header*/}
                                    <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
                                        <h3 className="text-2xl font-semibold text-red-600">
                                            Error
                                        </h3>
                                        <button
                                            className="p-1 ml-auto bg-transparent border-0 text-black opacity-70 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                            onClick={() => setIsFailureModalOpen(false)}
                                        >
                                            <span className="bg-transparent text-black h-6 w-6 text-2xl block outline-none focus:outline-none">
                                                ×
                                            </span>
                                        </button>
                                    </div>
                                    {/*body*/}
                                    <div className="relative p-6 flex-auto">
                                        <p className="my-4 text-gray-600 text-lg leading-relaxed">
                                            {failureMessage}
                                        </p>
                                    </div>
                                    {/*footer*/}
                                    <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b">
                                        <button
                                            className="bg-red-500 text-white hover:bg-red-600 active:bg-red-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                            type="button"
                                            onClick={() => setIsFailureModalOpen(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Backdrop for Failure Modal (Optional, creates the dimming effect) */}
                    {isFailureModalOpen && <div className="fixed inset-0 z-40 bg-black opacity-25"></div>}
                </div>
                 {/* Basic styling for inputs (add to your global CSS or Tailwind config) */}
                <style jsx global>{`
                    .input-form {
                        display: block;
                        width: 100%;
                        padding: 0.5rem 0.75rem;
                        font-size: 1rem;
                        line-height: 1.5;
                        color: #4A5568;
                        background-color: #fff;
                        background-clip: padding-box;
                        border: 1px solid #E2E8F0;
                        border-radius: 0.375rem;
                        box-shadow: inset 0 1px 2px rgba(0,0,0,0.075);
                        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                    }
                    .input-form:focus {
                        border-color: #4299E1;
                        outline: 0;
                        box-shadow: 0 0 0 0.2rem rgba(66, 153, 225, 0.25);
                    }
                    .btn { ${btnBase} }
                    .btn-primary { ${btnPrimary} }
                    .btn-secondary { ${btnSecondary} }
                    .btn-danger { ${btnDanger} }
                    .btn-success { ${btnSuccess} }
                    .btn-warning { ${btnWarning} }
                `}</style>
            </AuthenticatedLayout>
        </>
    );
};

export default Index;