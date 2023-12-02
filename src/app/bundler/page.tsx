import BundlerChecklist from "../../components/BundlerChecklist";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 dark:bg-gray-900">
      <BundlerChecklist />
    </main>
  );
}
