# QuantitySelector Component

A fully reusable, production-ready quantity selector component for React e-commerce applications with comprehensive input validation and auto-correction.

## Features

✅ **Manual Input** - Direct number input with real-time validation  
✅ **Increment/Decrement Buttons** - Styled +/- buttons with hover effects  
✅ **Input Validation** - Prevents negative, zero, empty, and invalid values  
✅ **Auto-Correction** - Automatically fixes invalid inputs on blur  
✅ **Min/Max Constraints** - Configurable minimum and maximum quantity limits  
✅ **Real-time Price Display** - Optional total price calculation  
✅ **Loading States** - Disabled state during async operations  
✅ **Accessibility** - Proper ARIA labels and keyboard navigation  
✅ **Responsive Design** - Three size variants (sm, md, lg)  
✅ **TypeScript Support** - Full type safety with comprehensive interfaces

## Installation

The component is already installed in your project at:
```
src/components/common/QuantitySelector.tsx
```

## Basic Usage

```tsx
import QuantitySelector from "@/components/common/QuantitySelector";

function MyComponent() {
  const [quantity, setQuantity] = useState(1);

  return (
    <QuantitySelector
      value={quantity}
      onChange={setQuantity}
      min={1}
      max={10}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | **Required** | Current quantity value |
| `onChange` | `(quantity: number) => void` | **Required** | Callback when quantity changes via input |
| `onIncrement` | `() => void` | `undefined` | Optional custom increment handler |
| `onDecrement` | `() => void` | `undefined` | Optional custom decrement handler |
| `min` | `number` | `1` | Minimum allowed quantity |
| `max` | `number` | `undefined` | Maximum allowed quantity (optional) |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `loading` | `boolean` | `false` | Show loading state |
| `showPrice` | `boolean` | `false` | Display total price calculation |
| `unitPrice` | `number` | `0` | Price per unit (required if showPrice is true) |
| `className` | `string` | `""` | Custom container styling |
| `inputClassName` | `string` | `""` | Custom input field styling |
| `buttonClassName` | `string` | `""` | Custom button styling |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Component size variant |

## Advanced Examples

### Product Page with Price Display

```tsx
import QuantitySelector from "@/components/common/QuantitySelector";

function ProductPage({ product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <QuantitySelector
      value={quantity}
      onChange={setQuantity}
      min={1}
      max={product.stock}
      showPrice={true}
      unitPrice={product.price}
      size="lg"
    />
  );
}
```

### Cart Item with Custom Handlers

```tsx
import QuantitySelector from "@/components/common/QuantitySelector";

function CartItem({ item, onUpdate, onRemove }) {
  const handleIncrement = async () => {
    await onUpdate(item.id, item.quantity + 1);
  };

  const handleDecrement = async () => {
    if (item.quantity === 1) {
      await onRemove(item.id);
    } else {
      await onUpdate(item.id, item.quantity - 1);
    }
  };

  return (
    <QuantitySelector
      value={item.quantity}
      onChange={(qty) => onUpdate(item.id, qty)}
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
      min={1}
      size="sm"
    />
  );
}
```

### With Loading State

```tsx
import QuantitySelector from "@/components/common/QuantitySelector";

function CartItem({ item }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (newQty) => {
    setIsUpdating(true);
    try {
      await updateCartAPI(item.id, newQty);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <QuantitySelector
      value={item.quantity}
      onChange={handleUpdate}
      loading={isUpdating}
      disabled={isUpdating}
      min={1}
    />
  );
}
```

## Validation Behavior

### Input Validation
- Only numeric characters are allowed
- Empty input is temporarily allowed (for clearing and retyping)
- Non-numeric input is ignored
- Values are validated against min/max constraints in real-time

### Auto-Correction on Blur
When the input field loses focus:
- Empty or invalid → resets to minimum (default: 1)
- Below minimum → resets to minimum
- Above maximum → resets to maximum
- Leading zeros are removed

### Button Behavior
- **Decrement button** is disabled when at minimum value
- **Increment button** is disabled when at maximum value (if max is set)
- Both buttons are disabled when `disabled` or `loading` props are true

## Styling

The component uses CSS variables from your existing design system:
- `--cta-Bg` - Button background color
- Tailwind CSS for layout and spacing

### Custom Styling Example

```tsx
<QuantitySelector
  value={quantity}
  onChange={setQuantity}
  className="my-custom-container"
  inputClassName="font-bold text-lg"
  buttonClassName="shadow-lg"
/>
```

## Size Variants

| Size | Button Padding | Input Height | Icon Size | Use Case |
|------|---------------|--------------|-----------|----------|
| `sm` | `px-2 py-1` | `h-7` | `w-3 h-3` | Cart items, compact layouts |
| `md` | `px-3 py-2` | `h-9` | `w-3.5 h-3.5` | Default, general use |
| `lg` | `px-4 py-3` | `h-11` | `w-4 h-4` | Product pages, emphasis |

## Integration with Existing Code

The component is already integrated with your `AddToCartButton` component:

```tsx
// src/components/common/cart/AddToCartButton.tsx
<QuantitySelector
  value={qty}
  onChange={(newQty) => {
    // Handles direct input changes
  }}
  onIncrement={() => {
    // Calls your existing increaseQty function
  }}
  onDecrement={() => {
    // Calls your existing decreaseQty function
  }}
  min={1}
  disabled={loading}
  loading={loading}
  className="w-full"
  size="md"
/>
```

## Accessibility

- Proper ARIA labels on buttons ("Increase quantity", "Decrease quantity")
- Input field has `aria-label="Quantity"`
- Keyboard navigation supported (Tab, Arrow keys)
- `inputMode="numeric"` for mobile keyboards
- Disabled states properly communicated to screen readers

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Testing Checklist

- [ ] Type valid numbers (1, 5, 10, 100)
- [ ] Type invalid inputs (0, -5, abc, empty)
- [ ] Click increment/decrement buttons
- [ ] Test at minimum boundary (decrement disabled)
- [ ] Test at maximum boundary (increment disabled)
- [ ] Blur with invalid value (auto-corrects)
- [ ] Test with loading state
- [ ] Test with disabled state
- [ ] Verify price calculation updates
- [ ] Test on mobile viewport

## License

Part of the Alpha Art & Events e-commerce platform.
