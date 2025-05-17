// import { useIllustration } from "@/libs/hooks/useIllustration";

export default function NotFoundPage() {
  //   const notFoundIllustration = useIllustration("not-found");
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <img
        src={""}
        alt="not found illustration"
        className="size-44 rounded-lg object-cover"
      />
      <h1 className="text-3xl">404 - Page Not Found</h1>
      <p className="text-default-500 text-base">It seems you are lost.</p>
    </div>
  );
}
