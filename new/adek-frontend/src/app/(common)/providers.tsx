"use client"
 
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
 
export interface CartItem {
  id: string
  name: string
  brand: string
  size: string
  price: number
  discountPrice?: number
  image?: string
  quantity: number
  maxQuantity: number
  color?: string
  colorName?: string
}
 
interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateItemQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
  saveForLater: (id: string) => void
  moveToCart: (id: string) => void
  savedItems: CartItem[]
  recentlyViewed: CartItem[]
  addToRecentlyViewed: (item: CartItem) => void
}
 
const CartContext = createContext<CartContextType | undefined>(undefined)
 
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [savedItems, setSavedItems] = useState<CartItem[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<CartItem[]>([])
 
  // Initialize cart from localStorage
  useEffect(() => {
    setMounted(true)
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
        setItems([])
      }
    }
  }, [])
 
  // Update localStorage when cart changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, mounted])
 
  useEffect(() => {
    if (mounted) {
      const storedSavedItems = localStorage.getItem("savedItems")
      const storedRecentlyViewed = localStorage.getItem("recentlyViewed")
 
      if (storedSavedItems) {
        try {
          setSavedItems(JSON.parse(storedSavedItems))
        } catch (error) {
          console.error("Failed to parse saved items from localStorage:", error)
          setSavedItems([])
        }
      }
 
      if (storedRecentlyViewed) {
        try {
          setRecentlyViewed(JSON.parse(storedRecentlyViewed))
        } catch (error) {
          console.error("Failed to parse recently viewed from localStorage:", error)
          setRecentlyViewed([])
        }
      }
    }
  }, [mounted])
 
  // Add this useEffect to save the savedItems and recentlyViewed to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("savedItems", JSON.stringify(savedItems))
      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed))
    }
  }, [savedItems, recentlyViewed, mounted])
 
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
 
  const totalPrice = items.reduce((total, item) => {
    const itemPrice = item.discountPrice || item.price
    return total + itemPrice * item.quantity
  }, 0)
 
  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id)
 
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems]
        const existingItem = updatedItems[existingItemIndex]
        // const newQuantity = existingItem.quantity + newItem.quantity
        const newQuantity =  newItem.quantity
 
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: Math.min(newQuantity, existingItem.maxQuantity),
        }
 
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, newItem]
      }
    })
  }
 
  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }
 
  const updateItemQuantity = (id: string | number, quantity: number) => {
    setItems((prevItems) => prevItems.map((item) => (item.id == id ? { ...item, quantity } : item)))
  }
 
  const clearCart = () => {
    setItems([])
  }
 
  const saveForLater = (id: string) => {
    setItems((prevItems) => {
      const itemToSave = prevItems.find((item) => item.id === id)
      if (itemToSave) {
        setSavedItems((prev) => [...prev, itemToSave])
        return prevItems.filter((item) => item.id !== id)
      }
      return prevItems
    })
  }
 
  const moveToCart = (id: string) => {
    setSavedItems((prevItems) => {
      const itemToMove = prevItems.find((item) => item.id === id)
      if (itemToMove) {
        addItem(itemToMove)
        return prevItems.filter((item) => item.id !== id)
      }
      return prevItems
    })
  }
 
  // Replace the addToRecentlyViewed function with this version that has proper safeguards
  const addToRecentlyViewed = useCallback(
    (item: CartItem) => {
      // First check if the item already exists to avoid unnecessary state updates
      if (recentlyViewed.some((i) => i.id === item.id)) {
        return // Early return if item is already in the list
      }
 
      // Use a functional update to ensure we're working with the latest state
      setRecentlyViewed((prev) => {
        // Create a new array with the new item at the beginning
        const newItems = [item, ...prev.filter((i) => i.id !== item.id)].slice(0, 5)
        return newItems
      })
    },
    [recentlyViewed],
  ) // Include recentlyViewed in dependencies to ensure proper updates
 
  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        saveForLater,
        moveToCart,
        savedItems,
        recentlyViewed,
        addToRecentlyViewed,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
 
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}