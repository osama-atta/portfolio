import { LedModule } from "./LedModule";
import { PoweredSection } from "./circuit/PoweredSection";

/** The LED display module, the first thing on the spine (bus 0). Click it to play brick breaker. */
export function DisplayModule() {
  return (
    <PoweredSection index={0} as="div" branch="edge" branchTop={44}>
      <LedModule />
    </PoweredSection>
  );
}
