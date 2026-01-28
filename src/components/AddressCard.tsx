import { Check, MapPin, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export interface SavedAddress {
    id: string;
    address: string;
    apartment: string | null;
    city: string;
    postal_code: string;
    phone: string;
    is_default: boolean;
    last_used: string | null;
}

interface AddressCardProps {
    address: SavedAddress;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: (e: React.MouseEvent) => void;
}

const AddressCard = ({ address, isSelected, onSelect, onDelete }: AddressCardProps) => {
    // Create a summary line for the address
    const addressSummary = [
        address.address,
        address.apartment,
        address.city,
        address.postal_code
    ].filter(Boolean).join(", ");

    return (
        <div className="relative group">
            <button
                type="button"
                onClick={onSelect}
                className={cn(
                    "relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-200",
                    "hover:shadow-md hover:scale-[1.01]",
                    isSelected
                        ? "border-accent bg-accent/5 shadow-sm"
                        : "border-border bg-background hover:border-accent/50"
                )}
            >
                {/* Selection Checkmark */}
                {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg z-10">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                )}

                {/* Default Badge */}
                {address.is_default && (
                    <div className="absolute top-3 right-3">
                        <span className="text-xs font-bold bg-accent/10 text-accent px-2 py-1 rounded-full">
                            Default
                        </span>
                    </div>
                )}

                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-accent" : "bg-secondary"
                    )}>
                        <MapPin className={cn(
                            "w-5 h-5",
                            isSelected ? "text-white" : "text-muted-foreground"
                        )} />
                    </div>

                    {/* Address Details */}
                    <div className="flex-1 min-w-0 pr-8">
                        <p className="font-bold text-sm truncate">
                            {address.address}
                        </p>
                        {address.apartment && (
                            <p className="text-xs text-muted-foreground truncate">
                                {address.apartment}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            {address.city}, {address.postal_code}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {address.phone}
                        </p>
                    </div>
                </div>
            </button>

            {/* Delete Button - Appears on hover */}
            <button
                type="button"
                onClick={onDelete}
                className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
                title="Delete address"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};

export default AddressCard;
