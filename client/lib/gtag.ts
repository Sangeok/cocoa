export const sendGAEvent = (
  eventName: string,
  eventParams?: { [key: string]: any }
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
}; 