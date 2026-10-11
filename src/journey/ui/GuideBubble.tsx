import type { ReactNode } from "react";
import type { JourneyPath } from "../engine/types";
import { GUIDES } from "../engine/steps";
import { GuideAvatar } from "../world/World2D";

/** Lo que dice el guía. Funciona también como subtítulo (aria-live). */
export function GuideBubble({ path, children }: { path: JourneyPath; children: ReactNode }) {
  const guide = GUIDES[path];
  return (
    <div className="jy-bubble">
      <span className="jy-bubble-avatar" data-path={path}>
        <GuideAvatar path={path} size={40} />
      </span>
      <div className="jy-bubble-body">
        <span className="jy-bubble-name">{guide.name}</span>
        <p className="jy-bubble-text" aria-live="polite">
          {children}
        </p>
      </div>
    </div>
  );
}
