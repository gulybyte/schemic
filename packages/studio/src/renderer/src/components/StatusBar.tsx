import { Fragment } from "react";
import type { StatusBarLayout } from "../settings/defs";
import { getSegment } from "../statusbar/registry";
import { useSetting } from "../store";

function renderSide(ids: string[]) {
  const segs = ids
    .map(getSegment)
    .filter((s): s is NonNullable<typeof s> => !!s);
  return segs.map((seg, i) => {
    const C = seg.Component;
    const prev = segs[i - 1];
    const divider = prev && prev.group !== seg.group;
    return (
      <Fragment key={seg.id}>
        {divider && <span className="status-divider" />}
        <C />
      </Fragment>
    );
  });
}

export function StatusBar() {
  const layout = useSetting<StatusBarLayout>("statusbar.segments");
  return (
    <footer className="statusbar">
      <div className="status-left">{renderSide(layout.left)}</div>
      <div className="status-right">{renderSide(layout.right)}</div>
    </footer>
  );
}
