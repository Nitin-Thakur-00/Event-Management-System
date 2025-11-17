import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterChange: (value: string) => void;
}

export const SearchFilter = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
}: SearchFilterProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-up">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border/50 focus:border-primary transition-all duration-300 focus:shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
        />
      </div>
      
      <div className="relative w-full md:w-48">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Select value={filterType} onValueChange={onFilterChange}>
          <SelectTrigger className="pl-10 bg-card border-border/50 focus:border-primary transition-all duration-300">
            <SelectValue placeholder="Filter by..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
