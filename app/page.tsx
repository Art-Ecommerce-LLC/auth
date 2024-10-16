  // pages/index.js (Client Component)
  "server-only";

  import ServerNavbar from '@/components/ServerNavbar'; // Import server-side component
  import HomeComponent from '@/components/HomeComponent';

  export default function Home() {
    return (
      <main>
        {/* Server-Side Component */}
        <ServerNavbar />  {/* This part is rendered server-side */}
        <HomeComponent /> {/* This part is rendered client-side */}
      </main>
    );
  }
