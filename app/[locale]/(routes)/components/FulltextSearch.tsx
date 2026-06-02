"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const FulltextSearch = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = async () => {
    router.push(`/fulltext-search?q=${search}`);
    setSearch("");
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-1 bg-muted/40 dark:bg-muted/15 rounded-full border border-border/40 p-0.5 pr-1 focus-within:border-primary/50 transition-all duration-200">
      <Input
        type="text"
        placeholder="Search something ..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9 rounded-full pl-3 text-xs w-[180px] sm:w-[220px]"
      />
      <Button 
        type="submit" 
        size="sm"
        className="gap-1.5 h-8 rounded-full px-3.5 text-xs shadow-sm shadow-primary/10 hover:scale-105 active:scale-95 transition-transform" 
        onClick={handleSearch}
      >
        <span className="hidden sm:flex">Search</span>
        <SearchIcon className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

export default FulltextSearch;
