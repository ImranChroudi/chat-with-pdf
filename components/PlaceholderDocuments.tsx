import { Button } from "./ui/button";
import { PlusCircleIcon } from "lucide-react";

function PlaceholderDocuments() {
  return (
    <Button className="flex flex-col items-center w-full h-full rounded-xl bg-gray-200 drop-shadow-md text-gray-400">
      <PlusCircleIcon className="h-16 w-16" />
      <p>Add a document</p>
    </Button>
  );
}

export default PlaceholderDocuments;
