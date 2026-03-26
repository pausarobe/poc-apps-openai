import { createRoot } from "react-dom/client";
import { ClerkProvider, SignIn } from "@clerk/clerk-react";

const clerkPubKey = __CLERK_PUBLISHABLE_KEY__;

if (typeof window !== "undefined" && document.getElementById("root")) {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <ClerkProvider publishableKey={clerkPubKey}>
      <SignIn />
    </ClerkProvider>
  );
}