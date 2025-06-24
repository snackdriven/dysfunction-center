import React from 'react';
import { 
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Badge,
  Avatar,
  AvatarFallback,
  Separator,
  Skeleton,
  Progress
} from '../components/ui';

export const UIDemo: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Phase 1 UI Components Demo</h1>
        <p className="text-muted-foreground mb-8">
          Showcasing the foundational design system components.
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and sizes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🚀</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
          <CardDescription>Form input components with validation states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Input 
              label="Email" 
              placeholder="Enter your email"
              helperText="We'll never share your email"
            />
            <Input 
              label="Password" 
              type="password"
              error="Password is required"
            />
            <Input 
              label="Search" 
              placeholder="Search..."
              startIcon={<span>🔍</span>}
            />
            <Input 
              label="Amount" 
              placeholder="0.00"
              endIcon={<span>$</span>}
            />
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status indicators and tags</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <Separator className="my-4" />
          <div className="flex gap-2 flex-wrap">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Avatars */}
      <Card>
        <CardHeader>
          <CardTitle>Avatars</CardTitle>
          <CardDescription>User profile images with fallbacks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Avatar size="sm">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar size="md">
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>CD</AvatarFallback>
            </Avatar>
            <Avatar size="xl">
              <AvatarFallback>EF</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>Progress indicators with variants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Default Progress</p>
              <Progress value={65} showValue />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Success Progress</p>
              <Progress value={80} variant="success" showValue />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Warning Progress</p>
              <Progress value={45} variant="warning" showValue />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skeletons */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Skeletons</CardTitle>
          <CardDescription>Placeholder components for loading states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton variant="rounded" className="h-12 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Card Variants</CardTitle>
          <CardDescription>Different card styles and layouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card variant="default" padding="sm">
              <CardContent>
                <p className="text-sm">Default card with small padding</p>
              </CardContent>
            </Card>
            <Card variant="elevated" padding="md">
              <CardContent>
                <p className="text-sm">Elevated card with medium padding</p>
              </CardContent>
            </Card>
            <Card variant="outline" padding="lg">
              <CardContent>
                <p className="text-sm">Outline card with large padding</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
