import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import AddressCard, { SavedAddress } from "./AddressCard";
import { cn } from "@/lib/utils";

interface AddressSelectorProps {
    addresses: SavedAddress[];
    onAddressSelect: (address: SavedAddress | null) => void;
    onAddNewClick: () => void;
    onDelete: (id: string) => void;
}

const AddressSelector = ({ addresses, onAddressSelect, onAddNewClick, onDelete }: AddressSelectorProps) => {
    // Sort addresses by last_used (most recent first), then find the default or first one
    const sortedAddresses = [...addresses].sort((a, b) => {
        if (!a.last_used) return 1;
        if (!b.last_used) return -1;
        return new Date(b.last_used).getTime() - new Date(a.last_used).getTime();
    });

    // Pre-select the most recently used address
    const [selectedId, setSelectedId] = useState<string | null>(
        sortedAddresses.length > 0 ? sortedAddresses[0].id : null
    );



    const handleSelect = (address: SavedAddress) => {
        setSelectedId(address.id);
        onAddressSelect(address);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent card selection on delete
        onDelete(id);
    };

    const handleAddNew = () => {
        setSelectedId(null);
        onAddressSelect(null);
        onAddNewClick();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-black tracking-tight">
                Saved Addresses
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Saved Address Cards */}
                {sortedAddresses.map((address) => (
                    <AddressCard
                        key={address.id}
                        address={address}
                        isSelected={selectedId === address.id}
                        onSelect={() => handleSelect(address)}
                        onDelete={(e) => handleDelete(e, address.id)}
                    />
                ))}

                {/* Add New Address Button */}
                <button
                    type="button"
                    onClick={handleAddNew}
                    className={cn(
                        "w-full p-4 rounded-2xl border-2 border-dashed transition-all duration-200",
                        "flex flex-col items-center justify-center gap-2 min-h-[120px]",
                        "hover:border-accent hover:bg-accent/5",
                        selectedId === null
                            ? "border-accent bg-accent/5"
                            : "border-border bg-background"
                    )}
                >
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        selectedId === null ? "bg-accent" : "bg-secondary"
                    )}>
                        <Plus className={cn(
                            "w-5 h-5",
                            selectedId === null ? "text-white" : "text-muted-foreground"
                        )} />
                    </div>
                    <span className="text-sm font-bold">Deliver to a new address</span>
                </button>
            </div>
        </div>
    );
};

export default AddressSelector;
