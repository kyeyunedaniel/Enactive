import { Link, Head } from '@inertiajs/react';
import NavLink from '@/Components/NavLink';
import PageHeaderUnauthenticated from '../../PageHeaderUnauthenticated';
import MainHeader from '../../MainHeader'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AboutData from './AboutData';
export default function About({auth}) {
    return (
        <>
            <Head title="About" />
    <AuthenticatedLayout
            user={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">About</h2>}
        >
            {/* <Head title="About" /> */}

     {/* {auth?'':(<MainHeader auth={auth}/>)} */}
     {/* <MainHeader auth={auth}/> */}
     <AboutData/>
   
    </AuthenticatedLayout>
    
    {auth?'':(<>
    <AboutData/>
    </>)} 
    </> 
    );
}

// import { Head } from '@inertiajs/react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import MainHeader from '../../MainHeader';
// import AboutData from './AboutData';

// export default function About({ auth }) {
//     return (
//         <>
//             <Head title="About" />
//             {auth ? (
//                 <AuthenticatedLayout
//                     user={auth}
//                     header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">About</h2>}
//                 >
//                     <AboutData />
//                 </AuthenticatedLayout>
//             ) : (
//                 <>
//                     <MainHeader />
//                     <AboutData />
//                 </>
//             )}
//         </>
//     );
// }
