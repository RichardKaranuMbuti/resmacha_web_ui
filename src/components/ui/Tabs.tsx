'use client';

// src/components/ui/Tabs.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import React, { useState } from 'react';

const tabsListVariants = cva(
  'flex',
  {
    variants: {
      variant: {
        default: 'border-b border-border',
        pills: 'space-x-1',
        cards: 'space-x-1',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const tabTriggerVariants = cva(
  'inline-flex items-center justify-center py-2 px-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:font-medium',
  {
    variants: {
      variant: {
        default: 'border-b-2 border-transparent data-[state=active]:border-lavender-500 data-[state=active]:text-lavender-700',
        pills: 'rounded-md bg-transparent data-[state=active]:bg-lavender-100 data-[state=active]:text-lavender-800',
        cards: 'border-b rounded-t-lg -mb-px border-transparent data-[state=active]:border-border data-[state=active]:border-b-background',
      },
      fullWidth: {
        true: 'flex-1 text-center',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const tabContentVariants = cva(
  'mt-2',
  {
    variants: {
      variant: {
        default: '',
        pills: 'p-1',
        cards: 'border border-border rounded-b-lg p-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface TabsContextValue {
  selectedIndex: number;
  onChange: (index: number) => void;
  variant: NonNullable<TabsProps['variant']>;
  fullWidth?: boolean;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof tabsListVariants> {
  defaultIndex?: number;
  onTabChange?: (index: number) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, variant = 'default', fullWidth, defaultIndex = 0, onTabChange, children, ...props }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

    const handleChange = (index: number) => {
      setSelectedIndex(index);
      onTabChange?.(index);
    };

    return (
      <TabsContext.Provider value={{ 
        selectedIndex, 
        onChange: handleChange, 
        variant: variant ?? 'default', 
        fullWidth: fullWidth ?? undefined 
      }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    
    if (!context) {
      throw new Error('TabsList must be used within a Tabs component');
    }
    
    const { variant, fullWidth } = context;

    return (
      <div
        ref={ref}
        role="tablist"
        className={tabsListVariants({ variant, fullWidth, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsList.displayName = 'TabsList';

interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  index: number;
}

const TabTrigger = React.forwardRef<HTMLButtonElement, TabTriggerProps>(
  ({ className, index, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    
    if (!context) {
      throw new Error('TabTrigger must be used within a Tabs component');
    }
    
    const { selectedIndex, onChange, variant, fullWidth } = context;
    const isActive = selectedIndex === index;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? 'active' : 'inactive'}
        onClick={() => onChange(index)}
        className={tabTriggerVariants({ variant, fullWidth, className })}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabTrigger.displayName = 'TabTrigger';

export interface TabContentProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
}

const TabContent = React.forwardRef<HTMLDivElement, TabContentProps>(
  ({ className, index, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    
    if (!context) {
      throw new Error('TabContent must be used within a Tabs component');
    }
    
    const { selectedIndex, variant } = context;
    const isActive = selectedIndex === index;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        className={tabContentVariants({ variant, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabContent.displayName = 'TabContent';

export {
  TabContent, Tabs,
  TabsList,
  TabTrigger
};
