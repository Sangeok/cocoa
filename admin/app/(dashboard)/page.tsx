import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your dashboard. Here you can manage your products and view analytics.
      </p>
    </div>
  );
}
