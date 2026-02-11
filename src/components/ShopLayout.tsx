import { Outlet } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

const ShopLayout = () => {
    return (
        <WishlistProvider>
            <CartProvider>
                <Outlet />
            </CartProvider>
        </WishlistProvider>
    );
};

export default ShopLayout;
