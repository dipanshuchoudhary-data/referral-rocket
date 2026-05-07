import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Gharpayy Referral" },
      { name: "description", content: "Refer friends looking for PGs, flats or homes in Bangalore. Earn ₹50 on lead verification, ₹500 on booking." },
      { property: "og:title", content: "Gharpayy Referral" },
      { name: "twitter:title", content: "Gharpayy Referral" },
      { property: "og:description", content: "Refer friends looking for PGs, flats or homes in Bangalore. Earn ₹50 on lead verification, ₹500 on booking." },
      { name: "twitter:description", content: "Refer friends looking for PGs, flats or homes in Bangalore. Earn ₹50 on lead verification, ₹500 on booking." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/db1db724-9f7e-48a7-a5ef-9c301f4c0327/id-preview-ddb8ccc7--ef6a4aed-d9c7-4e66-b633-78d780ab9aff.lovable.app-1778096349129.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/db1db724-9f7e-48a7-a5ef-9c301f4c0327/id-preview-ddb8ccc7--ef6a4aed-d9c7-4e66-b633-78d780ab9aff.lovable.app-1778096349129.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-display text-5xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <a href="/" className="mt-4 inline-block text-primary underline">Go home</a>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <button className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={() => { router.invalidate(); reset(); }}>Try again</button>
        </div>
      </div>
    );
  },
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
