/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export type PermissionStruct = { publicKey: BytesLike; signature: BytesLike };

export type PermissionStructOutput = [publicKey: string, signature: string] & {
  publicKey: string;
  signature: string;
};

export type InEuint128Struct = { data: BytesLike };

export type InEuint128StructOutput = [data: string] & { data: string };

export interface IFHERC20Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "_transferEncrypted"
      | "_transferFromEncrypted"
      | "allowanceEncrypted"
      | "approveEncrypted"
      | "balanceOfEncrypted(address,(bytes32,bytes))"
      | "balanceOfEncrypted()"
      | "decryptedBalanceOf(address)"
      | "decryptedBalanceOf()"
      | "transferEncrypted"
      | "transferFromEncrypted"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "ApprovalEncrypted" | "TransferEncrypted"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "_transferEncrypted",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "_transferFromEncrypted",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "allowanceEncrypted",
    values: [AddressLike, AddressLike, PermissionStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "approveEncrypted",
    values: [AddressLike, InEuint128Struct]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOfEncrypted(address,(bytes32,bytes))",
    values: [AddressLike, PermissionStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOfEncrypted()",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "decryptedBalanceOf(address)",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "decryptedBalanceOf()",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferEncrypted",
    values: [AddressLike, InEuint128Struct]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFromEncrypted",
    values: [AddressLike, AddressLike, InEuint128Struct]
  ): string;

  decodeFunctionResult(
    functionFragment: "_transferEncrypted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_transferFromEncrypted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "allowanceEncrypted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "approveEncrypted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "balanceOfEncrypted(address,(bytes32,bytes))",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "balanceOfEncrypted()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "decryptedBalanceOf(address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "decryptedBalanceOf()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferEncrypted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferFromEncrypted",
    data: BytesLike
  ): Result;
}

export namespace ApprovalEncryptedEvent {
  export type InputTuple = [owner: AddressLike, spender: AddressLike];
  export type OutputTuple = [owner: string, spender: string];
  export interface OutputObject {
    owner: string;
    spender: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TransferEncryptedEvent {
  export type InputTuple = [from: AddressLike, to: AddressLike];
  export type OutputTuple = [from: string, to: string];
  export interface OutputObject {
    from: string;
    to: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IFHERC20 extends BaseContract {
  connect(runner?: ContractRunner | null): IFHERC20;
  waitForDeployment(): Promise<this>;

  interface: IFHERC20Interface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  _transferEncrypted: TypedContractMethod<
    [to: AddressLike, value: BigNumberish],
    [bigint],
    "nonpayable"
  >;

  _transferFromEncrypted: TypedContractMethod<
    [from: AddressLike, to: AddressLike, value: BigNumberish],
    [bigint],
    "nonpayable"
  >;

  allowanceEncrypted: TypedContractMethod<
    [owner: AddressLike, spender: AddressLike, permission: PermissionStruct],
    [string],
    "view"
  >;

  approveEncrypted: TypedContractMethod<
    [spender: AddressLike, value: InEuint128Struct],
    [boolean],
    "nonpayable"
  >;

  "balanceOfEncrypted(address,(bytes32,bytes))": TypedContractMethod<
    [account: AddressLike, auth: PermissionStruct],
    [string],
    "view"
  >;

  "balanceOfEncrypted()": TypedContractMethod<[], [bigint], "view">;

  "decryptedBalanceOf(address)": TypedContractMethod<
    [account: AddressLike],
    [bigint],
    "view"
  >;

  "decryptedBalanceOf()": TypedContractMethod<[], [bigint], "view">;

  transferEncrypted: TypedContractMethod<
    [to: AddressLike, value: InEuint128Struct],
    [bigint],
    "nonpayable"
  >;

  transferFromEncrypted: TypedContractMethod<
    [from: AddressLike, to: AddressLike, value: InEuint128Struct],
    [bigint],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "_transferEncrypted"
  ): TypedContractMethod<
    [to: AddressLike, value: BigNumberish],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "_transferFromEncrypted"
  ): TypedContractMethod<
    [from: AddressLike, to: AddressLike, value: BigNumberish],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "allowanceEncrypted"
  ): TypedContractMethod<
    [owner: AddressLike, spender: AddressLike, permission: PermissionStruct],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "approveEncrypted"
  ): TypedContractMethod<
    [spender: AddressLike, value: InEuint128Struct],
    [boolean],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "balanceOfEncrypted(address,(bytes32,bytes))"
  ): TypedContractMethod<
    [account: AddressLike, auth: PermissionStruct],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "balanceOfEncrypted()"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "decryptedBalanceOf(address)"
  ): TypedContractMethod<[account: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "decryptedBalanceOf()"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "transferEncrypted"
  ): TypedContractMethod<
    [to: AddressLike, value: InEuint128Struct],
    [bigint],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferFromEncrypted"
  ): TypedContractMethod<
    [from: AddressLike, to: AddressLike, value: InEuint128Struct],
    [bigint],
    "nonpayable"
  >;

  getEvent(
    key: "ApprovalEncrypted"
  ): TypedContractEvent<
    ApprovalEncryptedEvent.InputTuple,
    ApprovalEncryptedEvent.OutputTuple,
    ApprovalEncryptedEvent.OutputObject
  >;
  getEvent(
    key: "TransferEncrypted"
  ): TypedContractEvent<
    TransferEncryptedEvent.InputTuple,
    TransferEncryptedEvent.OutputTuple,
    TransferEncryptedEvent.OutputObject
  >;

  filters: {
    "ApprovalEncrypted(address,address)": TypedContractEvent<
      ApprovalEncryptedEvent.InputTuple,
      ApprovalEncryptedEvent.OutputTuple,
      ApprovalEncryptedEvent.OutputObject
    >;
    ApprovalEncrypted: TypedContractEvent<
      ApprovalEncryptedEvent.InputTuple,
      ApprovalEncryptedEvent.OutputTuple,
      ApprovalEncryptedEvent.OutputObject
    >;

    "TransferEncrypted(address,address)": TypedContractEvent<
      TransferEncryptedEvent.InputTuple,
      TransferEncryptedEvent.OutputTuple,
      TransferEncryptedEvent.OutputObject
    >;
    TransferEncrypted: TypedContractEvent<
      TransferEncryptedEvent.InputTuple,
      TransferEncryptedEvent.OutputTuple,
      TransferEncryptedEvent.OutputObject
    >;
  };
}
