import { ServiceAlert } from '../types';

export const SERVICE_ALERTS: ServiceAlert[] = [
  {
    id: 'alert-pj-1',
    branch: 'Port Jefferson Branch',
    type: 'good',
    title: 'Good Service Operating',
    description: 'Trains on the Port Jefferson branch are running on or close to schedule in both directions.',
    timestamp: 'Updated 4 mins ago'
  },
  {
    id: 'alert-gcm-2',
    branch: 'Grand Central Madison',
    type: 'good',
    title: 'Direct East Side Access Open',
    description: 'Direct dual-mode and electric concourse escalators operating normally at 47th St & Madison Ave.',
    timestamp: 'Updated 12 mins ago'
  },
  {
    id: 'alert-jam-3',
    branch: 'Jamaica Hub',
    type: 'delay',
    title: 'Track 4 Connection Advisory',
    description: 'Passengers connecting to Brooklyn/Atlantic Terminal please allow 3 extra minutes for cross-platform transfer on Track 1.',
    timestamp: 'Updated 22 mins ago'
  },
  {
    id: 'alert-wea-4',
    branch: 'Systemwide',
    type: 'weather',
    title: 'Autumn Seasonal Rail Adhesion Alert',
    description: 'Specialized LaserTrain slip-prevention locomotives operating on northern branches. Normal speeds maintained.',
    timestamp: 'Today at 6:00 AM'
  }
];
