/**
 * MMGIA Design System — ponto de entrada.
 * Estilos: importe uma vez `./styles/index.css` (tokens + componentes) e, se quiser utilitários Tailwind ds-*, `./styles/theme.css`.
 */
export * from './tokens';
export { Button, LinkButton, type ButtonProps, type LinkButtonProps, type ButtonVariant, type ButtonSize } from './components/Button';
export { Badge, DimensionBadge, LevelBadge, StatusBadge, RiskBadge, NplfBadge, LegalBadge } from './components/Badge';
export { LevelMeter, DimensionTag, DimensionBars, DataTable, type Column } from './components/Data';
export { Card, CardHeader, CardBody, CardFooter, KpiCard, InsightCard, PracticeCard } from './components/Card';
export { Field, Input, Select, Textarea, Checkbox } from './components/Form';
export { OptionCard, RadioGroup, Pill, Segmented, Tabs } from './components/Selection';
export { DsRoot, PageHeader, Page, Grid, ActionBar, Steps, Banner } from './components/Layout';
