import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import TimeTracker from '../TimeTracker';
import { AuthContext } from '../../AuthContext';

// Use modern timers so we can manipulate system time for Date.now()
jest.useFakeTimers('modern');

// Provide a minimal Notification mock in the test environment
global.Notification = {
  permission: 'granted',
  requestPermission: jest.fn()
};

describe('TimeTracker', () => {
  test('calls onTimeUpdate with minutes when paused after running', () => {
    const onTimeUpdate = jest.fn();
    const task = { id: 1, title: 'Test', timeLimit: 2 }; // 2 minutes

    // set a baseline system time
    const baseline = Date.now();
    jest.setSystemTime(baseline);

    const { container } = render(
      <AuthContext.Provider value={{ user: { id: 42 } }}>
        <TimeTracker task={task} onTimeUpdate={onTimeUpdate} />
      </AuthContext.Provider>
    );

    // start button is the first .timer-btn
    const startBtn = container.querySelector('.timer-btn.play') || container.querySelector('.timer-btn');
    expect(startBtn).toBeTruthy();

    // click start
    act(() => {
      fireEvent.click(startBtn);
    });

    // advance timers by 125 seconds (~2 minutes)
    act(() => {
      jest.advanceTimersByTime(125000);
      jest.setSystemTime(baseline + 125000);
    });

    // click pause (the button should now have .pause class)
    const pauseBtn = container.querySelector('.timer-btn.pause') || startBtn;
    act(() => {
      fireEvent.click(pauseBtn);
    });

    // find a call where third arg (minutes) is provided
    const minuteCalls = onTimeUpdate.mock.calls.filter(c => c.length === 3 && typeof c[2] === 'number');
    expect(minuteCalls.length).toBeGreaterThan(0);
    // logged minutes should be at least 2
    const recorded = minuteCalls[0][2];
    expect(recorded).toBeGreaterThanOrEqual(2);
  });
});
