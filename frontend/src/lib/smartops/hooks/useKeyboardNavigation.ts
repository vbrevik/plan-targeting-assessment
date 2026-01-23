import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

interface UseKeyboardNavigationOptions<T> {
    items: T[];
    getItemId: (item: T) => string;
    onSelect?: (item: T) => void;
    onNavigate?: (item: T) => void;
    enabled?: boolean;
}

/**
 * Hook for keyboard navigation in lists and grids
 * 
 * - J/K or Arrow Down/Up: Navigate through items
 * - Enter: Select/open current item
 * - Esc: Clear selection / close panel
 * 
 * @example
 * const { selectedIndex, selectedItem, handleKeyDown } = useKeyboardNavigation({
 *   items: targets,
 *   getItemId: (t) => t.id,
 *   onSelect: (t) => navigate(`/target/${t.id}`),
 * });
 */
export function useKeyboardNavigation<T>({
    items,
    getItemId,
    onSelect,
    onNavigate,
    enabled = true,
}: UseKeyboardNavigationOptions<T>) {
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const navigate = useNavigate();

    const selectedItem = selectedIndex >= 0 && selectedIndex < items.length
        ? items[selectedIndex]
        : null;

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled || items.length === 0) return;

        switch (event.key) {
            case 'j':
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex(prev => {
                    const next = Math.min(prev + 1, items.length - 1);
                    if (onNavigate && items[next]) onNavigate(items[next]);
                    return next;
                });
                break;

            case 'k':
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex(prev => {
                    const next = Math.max(prev - 1, 0);
                    if (onNavigate && items[next]) onNavigate(items[next]);
                    return next;
                });
                break;

            case 'Enter':
                event.preventDefault();
                if (selectedItem && onSelect) {
                    onSelect(selectedItem);
                }
                break;

            case 'Escape':
                event.preventDefault();
                setSelectedIndex(-1);
                break;

            case 'Home':
                event.preventDefault();
                setSelectedIndex(0);
                if (onNavigate && items[0]) onNavigate(items[0]);
                break;

            case 'End':
                event.preventDefault();
                setSelectedIndex(items.length - 1);
                if (onNavigate && items[items.length - 1]) onNavigate(items[items.length - 1]);
                break;
        }
    }, [enabled, items, selectedItem, onSelect, onNavigate]);

    useEffect(() => {
        if (!enabled) return;

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [enabled, handleKeyDown]);

    // Reset selection when items change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [items.length]);

    return {
        selectedIndex,
        setSelectedIndex,
        selectedItem,
        isSelected: (item: T) => selectedItem !== null && getItemId(selectedItem) === getItemId(item),
    };
}

/**
 * Global keyboard shortcuts hook
 * 
 * - G + T: Go to Targets
 * - G + D: Go to Dashboard  
 * - G + B: Go to BDA
 * - N: New/Nominate target
 * - ?: Show shortcuts help
 */
export function useGlobalShortcuts() {
    const navigate = useNavigate();
    const [pendingG, setPendingG] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            // Handle G + key combinations
            if (pendingG) {
                setPendingG(false);
                switch (event.key.toLowerCase()) {
                    case 't':
                        event.preventDefault();
                        navigate({ to: '/smartops/targeting/targets' });
                        break;
                    case 'd':
                        event.preventDefault();
                        navigate({ to: '/smartops/targeting-cell-dashboard' });
                        break;
                    case 'b':
                        event.preventDefault();
                        navigate({ to: '/smartops/bda' });
                        break;
                    case 'r':
                        event.preventDefault();
                        navigate({ to: '/smartops/roe' });
                        break;
                }
                return;
            }

            // Start G sequence
            if (event.key === 'g' && !event.ctrlKey && !event.metaKey) {
                setPendingG(true);
                // Reset after 1 second
                setTimeout(() => setPendingG(false), 1000);
                return;
            }

            // Single key shortcuts
            switch (event.key) {
                case '?':
                    event.preventDefault();
                    setShowHelp(prev => !prev);
                    break;
                case 'n':
                    if (!event.ctrlKey && !event.metaKey) {
                        event.preventDefault();
                        navigate({ to: '/smartops/targeting/nominate' });
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [navigate, pendingG]);

    return { showHelp, setShowHelp, pendingG };
}
