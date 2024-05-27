import { ListPlusIcon } from "lucide-react";

import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function ListNavigationSkeletons() {
  return (
    <div className="flex items-center gap-x-1">
      {Array.from({ length: 3 }).map((_, idx) => (
        <Skeleton
          key={idx}
          className="flex h-6 w-20 select-text items-center justify-center rounded-full bg-gray-100 px-3 text-center text-xs font-medium hover:bg-gray-200"
        />
      ))}
      <Button className="flex h-6 select-text items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 px-3 text-center text-xs font-medium hover:bg-transparent">
        <ListPlusIcon className="mr-1.5 h-3.5 w-3.5" />
        New List
      </Button>
    </div>
  );
}
