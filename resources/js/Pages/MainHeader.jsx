import { Link, Head } from '@inertiajs/react';
import NavLink from '@/Components/NavLink';
import GlobalHeading from './GlobalHeading';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useEffect } from 'react';
function MainHeader({auth}) {
    useEffect(()=>{
        console.log("mainHeader "+JSON.stringify(auth))
    },[])
  return (
        <>
        {/* <div class="flex-1"> */}
        {/* <div className="shrink-0 flex items-center">
            <Link href="/">
                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
            </Link>
        </div> */}

        
        <div className="sm:fixed sm:top-0 sm:right-0 w-full p-6 text-end dark:bg-gray-100">
            {/* chnage the Dashboard from here  */}
                    {auth?.user ? (
                        <Link
                            href={route('dashboard')}
                            className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-900 dark:hover:text-black focus:outline focus:outline-2 focus:rounded-sm focus:outline-blue-500"
                        >
                            Dashboard
                        </Link>
                        
                    ) : (
                        <>
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>
                            <Link
                                href={route('login')}
                                className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-900 dark:hover:text-black focus:outline focus:outline-2 focus:rounded-sm focus:outline-blue-500"
                            >
                                Log in
                            </Link>

                            <Link
                                href={route('register')}
                                className="ms-4 font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-900 dark:hover:text-black focus:outline focus:outline-2 focus:rounded-sm focus:outline-blue-500"
                            >
                                Register
                            </Link>
                           
                        </>
                    )}
            <div>
            <GlobalHeading />
            </div>
        </div>
        {/* </div> */}
                </>
  )
}

export default MainHeader