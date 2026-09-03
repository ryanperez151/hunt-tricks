import { discoveryCredentialAccessHunts } from "@/data/hunts/discovery-credential-access";
import { infrastructureLateralMovementHunts } from "@/data/hunts/infrastructure-lateral-movement";
import { managementPlaneC2Hunts } from "@/data/hunts/management-plane-c2";
import { deepFreeze } from "@/data/hunts/shared";
import { trafficManipulationHunts } from "@/data/hunts/traffic-manipulation";
import { HuntSchema, type Hunt } from "@/lib/schemas";

export {
  discoveryCredentialAccessHunts,
  infrastructureLateralMovementHunts,
  managementPlaneC2Hunts,
  trafficManipulationHunts,
};

export const hunts = deepFreeze(HuntSchema.array().parse([
  ...managementPlaneC2Hunts,
  ...infrastructureLateralMovementHunts,
  ...discoveryCredentialAccessHunts,
  ...trafficManipulationHunts,
])) as readonly Hunt[];
