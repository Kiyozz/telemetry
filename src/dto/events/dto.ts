import { IsObject, IsString } from 'class-validator'

export class PostEventV1 {
  @IsString()
  public type: string

  @IsString()
  public appKey: string

  @IsObject()
  public properties: Record<string, unknown> = {}

  public get propertiesString(): string {
    return JSON.stringify(this.properties)
  }
}

export class PostEventV2 {
  @IsString()
  public type: string

  @IsString()
  public appId: string

  @IsObject()
  public properties: Record<string, unknown> = {}
}
