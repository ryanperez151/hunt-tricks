import { discoveryCredentialAccessHunts } from "@/data/hunts/discovery-credential-access";
import { infrastructureLateralMovementHunts } from "@/data/hunts/infrastructure-lateral-movement";
import { managementPlaneC2Hunts } from "@/data/hunts/management-plane-c2";
import { deepFreeze } from "@/data/hunts/shared";
import { trafficManipulationHunts } from "@/data/hunts/traffic-manipulation";
import { deliveryContainerHunts } from "@/data/hunts/expanded/delivery-containers";
import { endpointCloudDataHunts } from "@/data/hunts/expanded/endpoint-cloud-data";
import { identityEmailSaasHunts } from "@/data/hunts/expanded/identity-email-saas";
import { infrastructureContextBySlug } from "@/data/hunts/expanded/infrastructure-context";
import { otAiHunts } from "@/data/hunts/expanded/ot-ai";
import { HuntSchema, type Hunt } from "@/lib/schemas";

export {
  discoveryCredentialAccessHunts,
  infrastructureLateralMovementHunts,
  managementPlaneC2Hunts,
  trafficManipulationHunts,
};

const legacyHunts = [
  ...managementPlaneC2Hunts,
  ...infrastructureLateralMovementHunts,
  ...discoveryCredentialAccessHunts,
  ...trafficManipulationHunts,
].map((hunt) => ({ ...hunt, ...infrastructureContextBySlug[hunt.slug as keyof typeof infrastructureContextBySlug] }));

export const expandedHunts = deepFreeze(HuntSchema.array().parse([
  ...identityEmailSaasHunts,
  ...endpointCloudDataHunts,
  ...deliveryContainerHunts,
  ...otAiHunts,
])) as readonly Hunt[];

export const hunts = deepFreeze(HuntSchema.array().parse([
  ...legacyHunts,
  ...expandedHunts,
])) as readonly Hunt[];
