import { IsObject, IsString } from 'class-validator'

export class PostEvent {
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
