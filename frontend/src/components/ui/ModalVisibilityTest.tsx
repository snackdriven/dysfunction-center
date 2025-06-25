// Modal Visibility Test Component
// This is a temporary test component to validate modal behavior
// Remove this file once testing is complete

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

const ModalVisibilityTest: React.FC = () => {
  const [isShortModalOpen, setIsShortModalOpen] = useState(false);
  const [isLongModalOpen, setIsLongModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const longContent = Array.from({ length: 50 }, (_, i) => (
    <p key={i} className="mb-2">
      This is paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </p>
  ));

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Modal Visibility Tests</h2>
      <p className="text-gray-600">Test modals to ensure they're fully visible on all screen sizes.</p>
      
      <div className="flex flex-wrap gap-4">
        {/* Short Modal Test */}
        <Dialog open={isShortModalOpen} onOpenChange={setIsShortModalOpen}>
          <DialogTrigger asChild>
            <Button>Test Short Modal</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Short Modal Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>This is a short modal with minimal content.</p>
              <p>It should be centered and fully visible.</p>
              <Button onClick={() => setIsShortModalOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Long Content Modal Test */}
        <Dialog open={isLongModalOpen} onOpenChange={setIsLongModalOpen}>
          <DialogTrigger asChild>
            <Button>Test Long Modal</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Long Content Modal Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This modal has very long content to test scrolling behavior.
              </p>
              {longContent}
              <Button onClick={() => setIsLongModalOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Form Modal Test */}
        <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
          <DialogTrigger asChild>
            <Button>Test Form Modal</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Form Modal Test</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <Input label="Name" placeholder="Enter your name" />
              <Input label="Email" type="email" placeholder="Enter your email" />
              <Input label="Phone" type="tel" placeholder="Enter your phone" />
              <Textarea label="Description" rows={4} placeholder="Enter description" />
              <Input label="Date" type="date" />
              <Input label="Time" type="time" />
              <Textarea label="Notes" rows={6} placeholder="Enter detailed notes here..." />
              <Input label="Website" type="url" placeholder="Enter website URL" />
              <Input label="Number" type="number" placeholder="Enter a number" />
              <Textarea label="Long Text" rows={8} placeholder="Enter a very long text here..." />
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800">Testing Instructions:</h3>
        <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>Test each modal on different screen sizes (desktop, tablet, mobile)</li>
          <li>Verify that the close button is always accessible</li>
          <li>Check that long content scrolls properly within the modal</li>
          <li>Ensure form inputs are fully visible and accessible</li>
          <li>Test keyboard navigation (Tab, Enter, Escape)</li>
          <li>Verify that modals don't extend beyond viewport bounds</li>
        </ul>
      </div>
    </div>
  );
};

export default ModalVisibilityTest;
