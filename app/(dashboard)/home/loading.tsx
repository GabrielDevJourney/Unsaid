import { Skeleton } from "@/components/ui/skeleton";

const HomeLoading = () => {
    return (
        <div className="flex h-full">
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header skeleton */}
                <div className="flex h-16 items-center border-b px-8">
                    <Skeleton className="h-8 w-48" />
                </div>

                {/* Content skeleton */}
                <div className="flex-1 px-6 py-6 space-y-4">
                    <Skeleton className="h-10 w-full max-w-md" />
                    <div className="grid gap-3">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Aside skeleton — desktop only */}
            <aside className="hidden w-73 shrink-0 border-l xl:flex xl:flex-col gap-4 p-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-24 w-full" />
            </aside>
        </div>
    );
};

export default HomeLoading;
