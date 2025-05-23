import React from 'react';
import { useFloating, useHover, useInteractions, offset, shift, flip } from '@floating-ui/react';
import { Info } from 'lucide-react';

/**
 * Tooltip component that displays additional information on hover
 * @param {Object} props - Component props
 * @param {string} props.content - The tooltip content to display
 * @param {string} [props.position='top'] - The preferred position of the tooltip
 * @returns {React.ReactElement} Rendered tooltip component
 */
const Tooltip = ({ content, position = 'top' }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), shift(), flip()],
    placement: position,
  });

  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <span className="inline-flex items-center">
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        className="inline-flex cursor-help ml-1"
      >
        <Info className="w-4 h-4 text-gray-500" />
      </span>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-50 max-w-xs bg-gray-900 text-white text-sm rounded-lg px-3 py-2 animate-in fade-in duration-200"
        >
          {content}
        </div>
      )}
    </span>
  );
};

export default Tooltip;