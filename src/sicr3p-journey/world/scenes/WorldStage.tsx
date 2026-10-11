import { Component, Suspense, lazy, type ReactNode } from "react";
import { World2D } from "./World2D";
import type { WorldViewProps } from "./World3D";

// Carga progresiva: three.js sólo se descarga cuando se usa el mundo 3D.
const World3D = lazy(() => import("./World3D"));

/** Si el 3D falla en tiempo de ejecución, cae al 2D sin romper el recorrido. */
class Fallback extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function WorldStage({ use3D, ...view }: WorldViewProps & { use3D: boolean }) {
  const flat = <World2D {...view} />;
  return (
    <div className="jy-stage">
      {use3D ? (
        <Fallback fallback={flat}>
          <Suspense fallback={flat}>
            <World3D {...view} />
          </Suspense>
        </Fallback>
      ) : (
        flat
      )}
    </div>
  );
}
