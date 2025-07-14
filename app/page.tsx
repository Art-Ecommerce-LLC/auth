  // pages/index.js (Client Component)
  "server-only";
  // TODO - Make subscription plan, only one. The free trial is 7 days. Put stripe in production mode.
  // TODO - 
  // Make table into this structure:
  // Permit Type	e.g. SolarAPP+ PV with Battery	Tells contractor if the job matches their trade
  //  Issue Date	e.g. June 29, 2025	Shows recency — fresh = higher conversion chance
  //  Address	e.g. 782 Sparta Dr, Encinitas	Needed for canvassing, targeting, or routing
  //  Description	e.g. Install 22 panel solar + Tesla Powerwall	Signals project size/scope
  //  Project Value	e.g. $42,000	Helps qualify how lucrative the job might be
  //  Status	e.g. Issued / Finaled	Tells if it’s new or already complete
  //  Permit Number	e.g. MECH-035822-2025	Gives trust & reference if contractor wants to verify it
  //  Recommended Roles	e.g. Electrician, Roofer	Makes it obvious who should care about this lead
  //  Urgency Score (optional)	e.g. High (issued < 48h ago)	Helps sort which leads to act on first
  // TODO - Make subscription page so users can pick which roles they want to be alerted to
  // Fix data from ai to make it consistent with the structure and more realistic


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
