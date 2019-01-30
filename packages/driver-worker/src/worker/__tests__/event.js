import Event from '../Event';

describe('Event', () => {
  it('contructor', () => {
    const event = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    expect(event.type).toEqual('input');
    expect(event.bubbles).toEqual(true);
    expect(event.cancelable).toEqual(true);
  });

  it('stopPropagation', () => {
    const event = new Event('input');
    event.stopPropagation();
    expect(event._stop).toEqual(true);
  });

  it('stopImmediatePropagation', () => {
    const event = new Event('input');
    event.stopImmediatePropagation();
    expect(event._stop).toEqual(true);
    expect(event._end).toEqual(true);
  });

  it('preventDefault', () => {
    const event = new Event('input');
    event.preventDefault();
    expect(event.defaultPrevented).toEqual(true);
  });
});
