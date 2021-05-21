import { IsString } from 'class-validator'

export class PostApp {
  @IsString()
  name: string
}

export class PutApp {
  @IsString()
  name: string
}
