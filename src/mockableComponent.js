import React from 'react';

export const useMockableComponent = (type) => {
  if (!global.mockableComponentRegistry) global.mockableComponentRegistry = {}
  return global.mockableComponentRegistry[type] || type
}

export const createMockableElement = (type, props, ...children) =>
  React.createElement(useMockableComponent(type), props, ...children)

export const mockComponent = (type, mock) => {
  if (!global.mockableComponentRegistry) global.mockableComponentRegistry = {}
  global.mockableComponentRegistry = { ...global.mockableComponentRegistry, [type]: mock }
}

export const clearRegistry = () => {
  global.mockableComponentRegistry = undefined;
}
