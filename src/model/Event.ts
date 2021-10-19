export enum Kind {
  Unknown = "Unknown",
  Pod = "Pod",
  Deployment = "Deployment",
  ReplicaSet = "ReplicaSet",
}

export enum Reason {
  // Pods
  BackOff = "BackOff",
  Created = "Created",
  Failed = "Failed",
  Pulling = "Pulling",
  Pulled = "Pulled",
  Killing = "Killing",
  Scheduled = "Scheduled",
  Started = "Started",

  // ReplicaSets
  SuccessfulCreate = "SuccessfulCreate",
  SuccessfulDelete = "SuccessfulDelete",

  // Deployment
  ScalingReplicaSet = "ScalingReplicaSet",
}

export interface Event {
  name?: string;
  kind?: Kind;
  namespace?: string;
  fieldPath?: string;
  reason?: Reason;
  message?: string;
  type?: string;
  firstTimestamp?: Date;
  lastTimestamp?: Date;
}
