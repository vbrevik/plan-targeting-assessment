import { Fragment } from 'react';
import { SmartTag } from '../shared/SmartTag';

interface PlanContentRendererProps {
    content: string;
}

export function PlanContentRenderer({ content }: PlanContentRendererProps) {
    // Regex to match [[Type:ID|Label]]
    const tagRegex = /\[\[([a-zA-Z]+):([a-zA-Z0-9\-]+)\|([^\]]+)\]\]/g;

    // Split content into parts
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
        }

        const type = match[1];
        const id = match[2];
        const label = match[3];

        // Add the SmartTag component
        parts.push(
            <SmartTag
                key={`${type}-${id}-${match.index}`}
                type={type}
                id={id}
                label={label}
            />
        );

        lastIndex = tagRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }

    if (parts.length === 0) return <div className="text-slate-300">{content}</div>;

    return (
        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {parts.map((part, i) => (
                <Fragment key={i}>
                    {typeof part === 'string' ? (
                        // Simple HTML rendering for strings if needed, 
                        // but for now we'll just render text or use a simple HTML to React converter if necessary.
                        // Since we are moving away from dangerouslySetInnerHTML to allow components,
                        // we'll just handle basic line breaks for now.
                        <span dangerouslySetInnerHTML={{ __html: part }} />
                    ) : (
                        part
                    )}
                </Fragment>
            ))}
        </div>
    );
}
