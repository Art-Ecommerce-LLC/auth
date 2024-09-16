import { OTPForm } from "@/components/form/OTPForm"

export default function OTPPage() {
  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-primary text-primary-foreground">
        <div className="w-full max-w-96 min-w-80 p-2">
            <OTPForm/>
        </div>        
    </main>
  );
}
