## Packages
framer-motion | For smooth control transitions and page animations
react-icons | For additional icons if lucide-react is insufficient (optional, sticking to Lucide mostly)
clsx | For conditional class merging
tailwind-merge | For merging tailwind classes safely

## Notes
- Tailwind config needs to extend fontFamily for 'display' and 'body' fonts.
- Camera interface will be simulated with a placeholder for now, as browser camera access requires HTTPS and permission handling which might be complex for this initial generation, but I will build the UI controls around it.
- Stripe checkout integration relies on backend endpoints `/api/checkout` and `/api/subscription`.
