import React from 'react';
import { render } from '@testing-library/react';
import { EmptyState } from '@/components/common/EmptyState';

describe('Diagnosis', () => {
  it('should render component', async () => {
    render(<EmptyState type="default" />);
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  
  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('--- START DIAGNOSIS ---');
    // @ts-ignore
    const handles = process._getActiveHandles();
    console.log(`Active Handles: ${handles.length}`);
    handles.forEach((h: any) => {
      if (h.constructor && h.constructor.name) {
         let info = `- ${h.constructor.name}`;
         if (h.constructor.name === 'Socket') {
             info += ` (Address: ${h.remoteAddress}:${h.remotePort})`;
         } else if (h.constructor.name === 'Timer') {
             info += ` (Timeout: ${h._idleTimeout})`;
         } else if (h.constructor.name === 'MessagePort') {
             info += ` (MessagePort)`;
         }
         console.log(info);
      } else {
         console.log('- Unknown handle', h);
      }
    });

    console.log('--- END DIAGNOSIS ---');
  });
});
