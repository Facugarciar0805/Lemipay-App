# UI/UX Changes Reference

## Visual Layout Changes

### 1. Contributions Panel - New Withdraw Button

**Previous Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [Total Aportado]  [Saldos y Deudas]                   │
├─────────────────────────────────────────────────────────┤
│  [👤] Juan                          │  150.00 USDC      │
│  Aportante                          │                   │
├─────────────────────────────────────────────────────────┤
│  [👤] Maria                         │  200.00 USDC      │
│  Aportante                          │                   │
└─────────────────────────────────────────────────────────┘
```

**Updated Layout (with active round):**
```
┌─────────────────────────────────────────────────────────┐
│  [Total Aportado]  [Saldos y Deudas]                   │
├─────────────────────────────────────────────────────────┤
│  [👤] Juan                          │  150.00 USDC [↪] │
│  Aportante                          │  [Retirar]       │
├─────────────────────────────────────────────────────────┤
│  [👤] Maria                         │  200.00 USDC      │
│  Aportante                          │                   │
└─────────────────────────────────────────────────────────┘
```

- Button only appears for current user
- Button only appears during active rounds
- Button styled as ghost variant (minimal, outline)
- Mobile: Shows icon only [↪], tooltip shows on hover
- Desktop: Shows "Retirar" text next to icon

---

### 2. Release Proposals - New Cancel Button

**Previous Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  Propuestas de Pago      [+ Crear propuesta de pago]   │
├──────────────────────────────────────────────────────────┤
│  G...4xK2                                                │
│  Monto: 100.00 USDC                                     │
│  2 de 3 firmas                                          │
│                                      [Firmar]            │
├──────────────────────────────────────────────────────────┤
│  G...7xM8                                                │
│  Monto: 50.00 USDC                                      │
│  1 de 3 firmas                                          │
│                                      [Firmar]            │
└──────────────────────────────────────────────────────────┘
```

**Updated Layout (unapproved proposals):**
```
┌──────────────────────────────────────────────────────────┐
│  Propuestas de Pago      [+ Crear propuesta de pago]   │
├──────────────────────────────────────────────────────────┤
│  G...4xK2                                                │
│  Monto: 100.00 USDC                                     │
│  2 de 3 firmas                                          │
│                                  [Firmar] [Cancelar]    │
├──────────────────────────────────────────────────────────┤
│  G...7xM8                                                │
│  Monto: 50.00 USDC                                      │
│  1 de 3 firmas                                          │
│                                  [Firmar] [Cancelar]    │
└──────────────────────────────────────────────────────────┘
```

**With Ready to Execute (3/3 approvals):**
```
┌──────────────────────────────────────────────────────────┐
│  Propuestas de Pago      [+ Crear propuesta de pago]   │
├──────────────────────────────────────────────────────────┤
│  G...4xK2                                                │
│  Monto: 100.00 USDC                                     │
│  3 de 3 firmas                                          │
│                                  [Ejecutar Pago]        │
├──────────────────────────────────────────────────────────┤
│  G...7xM8                                                │
│  Monto: 50.00 USDC                                      │
│  1 de 3 firmas                                          │
│                                  [Firmar] [Cancelar]    │
└──────────────────────────────────────────────────────────┘
```

**When Executed:**
```
┌──────────────────────────────────────────────────────────┐
│  Propuestas de Pago      [+ Crear propuesta de pago]   │
├──────────────────────────────────────────────────────────┤
│  G...4xK2                                                │
│  Monto: 100.00 USDC                                     │
│  3 de 3 firmas                                          │
│                                  [✓ Ejecutado]          │
└──────────────────────────────────────────────────────────┘
```

- Cancel button appears when approvals < threshold AND not executed
- Cancel button disappears when ready to execute or already executed
- Cancel button styled as outline variant (secondary action)
- Buttons stack on mobile, row on desktop

---

## Modal Designs

### Withdraw Contribution Modal

```
┌────────────────────────────────────────────┐
│  Retirar aporte                        [✕] │
├────────────────────────────────────────────┤
│                                            │
│  ¿Estás seguro de que querés retirar tu  │
│  aporte de esta ronda de fondeo?          │
│                                            │
│  Se transferirá tu USDC de vuelta a tu    │
│  billetera una vez que se confirme la     │
│  transacción.                             │
│                                            │
├────────────────────────────────────────────┤
│                  [Cancelar] [Retirar aporte]│
└────────────────────────────────────────────┘
```

**States:**
- Normal: Both buttons enabled
- Loading: Spinner in "Retirar aporte" button, both disabled
- Success: Modal closes, page refreshes
- Error: Red banner appears above buttons with error message

### Cancel Release Proposal Modal

```
┌────────────────────────────────────────────┐
│  Cancelar propuesta de pago           [✕] │
├────────────────────────────────────────────┤
│                                            │
│  ¿Estás seguro de que querés cancelar    │
│  esta propuesta de pago?                  │
│                                            │
│  ┌────────────────────────────────────┐  │
│  │ Monto: 100.00 USDC                 │  │
│  │ Destino: G...4xK2                  │  │
│  └────────────────────────────────────┘  │
│                                            │
│  Una vez cancelada, la propuesta no podrá │
│  ser ejecutada y los fondos permanecerán  │
│  en la tesorería.                         │
│                                            │
├────────────────────────────────────────────┤
│            [Seguir adelante] [Cancelar]   │
└────────────────────────────────────────────┘
```

**States:**
- Normal: Both buttons enabled
- Loading: Spinner in "Cancelar" button, both disabled
- Success: Modal closes, proposal removed, page refreshes
- Error: Red banner appears above buttons with error message

---

## Color Codes Used

### Primary Actions
- Background: `bg-primary` (lime green)
- Text: `text-primary-foreground` (dark)
- Border: `border-primary`
- Used for: Approve, Execute, Contribute, Withdraw

### Secondary Actions
- Background: `bg-brand-purple` (purple)
- Text: `text-white`
- Used for: Approve proposals, Saldos tab

### Destructive Actions
- Background: `bg-destructive/10` (light red)
- Text: `text-destructive` (red)
- Border: `border-destructive/30`
- Used for: Cancel, Withdraw, Error messages

### Neutral/Outline
- Background: transparent
- Border: `border-border`
- Used for: Secondary buttons (Cancel in modals)

---

## Responsive Behavior

### Mobile (< 640px)
- Buttons stack vertically in modals
- Withdraw button shows icon only [↪], text hidden
- Proposal buttons remain inline but may wrap
- Modal takes full width with padding

### Tablet (640px - 1024px)
- Buttons inline in modals
- Withdraw button shows icon + "Retirar" text
- Proposal buttons stay inline

### Desktop (> 1024px)
- Full spacing and padding
- All text visible
- Optimized layout with max-width containers

---

## Error States

### Error Banner (Top of Page)
```
┌────────────────────────────────────────────┐
│ ⚠️  La transacción falló en la red.        │
└────────────────────────────────────────────┘
```

**Styling:**
- Border: red/destructive color (semi-transparent)
- Background: red/destructive with 10% opacity
- Icon: AlertTriangle from lucide-react
- Text: destructive color
- Position: Below navbar, above content

### Error in Modal
```
┌────────────────────────────────────────────┐
│  Retirar aporte                        [✕] │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ ⚠️  Error message goes here           │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Main content...                           │
│                                            │
├────────────────────────────────────────────┤
│                  [Cancelar] [Retirar aporte]│
└────────────────────────────────────────────┘
```

**Styling:**
- Border: red/destructive (semi-transparent)
- Background: red/destructive with 10% opacity
- Icon: AlertCircle
- Positioned above buttons in modal

---

## Loading States

### Button Loading
```
[🔄 Retirando…]  or  [🔄 Cancelando…]
```

**Changes:**
- Icon: Loader2 with animate-spin
- Text: Changes to action verb + "…"
- All buttons disabled during loading
- Button remains full width on mobile

### Page-level Loading
```
        🔄 (spinning)
   Sincronizando con Stellar...
```

- Large spinner icon
- Loading text below
- Centered on page
- Full screen overlay feel

---

## Animations

### Fade In
```css
/* Staggered animation on load */
Section 1: animation-delay: 0s
Section 2: animation-delay: 0.1s
Section 3: animation-delay: 0.2s
Section 4: animation-delay: 0.3s
```

### Spinner
```css
/* Continuous rotation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Hover Effects
- Buttons: `hover:brightness-110`, `hover:glow-lime`
- Cards: `hover:bg-muted/20`
- Links: `hover:text-foreground`

---

## Accessibility

✅ **Keyboard Navigation**
- Tab through buttons in order
- Enter to activate buttons
- Escape to close modals

✅ **Screen Readers**
- Dialog semantic HTML
- Button labels clear and descriptive
- Error messages announced
- Loading states indicated

✅ **Visual Indicators**
- Color not only cue (use icons too)
- Sufficient contrast ratios
- Focus states visible
- Hover states clear

---

## Summary

The integration adds two new features while maintaining perfect consistency with the existing design system:

✅ Withdraw button in contributions (minimal, non-intrusive)
✅ Cancel button in proposals (secondary position, paired with primary action)
✅ Two matching modals with clear confirmation flows
✅ Error handling with consistent banner styles
✅ Loading states with spinners
✅ Responsive design for all screen sizes
✅ Accessible for keyboard and screen reader users
✅ Smooth animations matching existing system
✅ Color scheme perfectly aligned with existing colors

The new features feel like natural extensions of the existing UI rather than additions.

