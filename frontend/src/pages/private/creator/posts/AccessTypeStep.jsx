import React from 'react';
import { Globe, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const AccessTypeStep = ({ accessType, setAccessType, onContinue, error, setError }) => {
  return (
    <div className="container mx-auto py-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Choose Video Access Type</CardTitle>
            <CardDescription>
              Select whether this video will be free or paid content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={accessType}
              onValueChange={setAccessType}
              className="space-y-4"
            >
              <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="free" id="free" className="mt-1" />
                <Label htmlFor="free" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-5 w-5" />
                    <span className="font-semibold">Free Video</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload via UploadThing - anyone can access this video
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    • Max file size: 500MB<br />
                    • Supports MP4, MOV, M4V, MPEG formats
                  </div>
                </Label>
              </div>

              <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="paid" id="paid" className="mt-1" />
                <Label htmlFor="paid" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-5 w-5" />
                    <span className="font-semibold">Paid/Exclusive Video</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload via Mux - only subscribers can access with secure playback
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    • No file size limit<br />
                    • Secure signed URLs<br />
                    • Advanced video processing
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={() => {
                if (!accessType) {
                  setError('Please select an access type');
                  return;
                }
                setError(null);
                onContinue();
              }}
              className="w-full"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessTypeStep;