// Material Design 3 Component Library
// Athletic Labs SaaS Platform

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from './Card';
export type { CardProps } from './Card';

export { TextField } from './TextField';
export type { TextFieldProps } from './TextField';

export { DataTable } from './DataTable';
export type { DataTableProps, Column } from './DataTable';

export { NavigationRail, NavigationRailExpanded } from './NavigationRail';
export type { 
  NavigationRailProps, 
  NavigationRailExpandedProps, 
  NavigationItem 
} from './NavigationRail';

export { ThemeSelector, QuickThemeSwitcher } from './ThemeSelector';
export type { Material3Theme } from '../theme/ThemeProvider';

// New Material 3 components
export { IconButton } from './IconButton';
export type { IconButtonProps } from './IconButton';

export { Chip } from './Chip';
export type { ChipProps } from './Chip';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { LinearProgress, CircularProgress } from './Progress';
export type { LinearProgressProps, CircularProgressProps } from './Progress';

export { Snackbar, useSnackbar } from './Snackbar';
export type { SnackbarProps } from './Snackbar';

export { Switch } from './Switch';
export type { SwitchProps } from './Switch';

export { Slider } from './Slider';
export type { SliderProps } from './Slider';

// Accessibility components
export { ScreenReaderOnly, FocusTrap, LiveRegion, GlobalLiveAnnouncer } from '../accessibility';