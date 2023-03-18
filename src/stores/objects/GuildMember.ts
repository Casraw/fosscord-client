import {
  APIGuildMember,
  APIUser,
  GatewayGuildMemberListUpdateMember,
  GuildMemberFlags,
} from '@puyodead1/fosscord-api-types/v9';
import {action, observable} from 'mobx';
import BaseStore from '../BaseStore';
import {DomainStore} from '../DomainStore';
import Guild from './Guild';
import Role from './Role';

export default class GuildMember extends BaseStore {
  private readonly domain: DomainStore;
  private readonly guild: Guild;

  @observable user?: APIUser | undefined;
  @observable nick?: string | null | undefined;
  @observable avatar?: string | null | undefined;
  @observable roles: Role[];
  @observable joined_at: string;
  @observable premium_since?: string | null | undefined;
  @observable deaf: boolean;
  @observable mute: boolean;
  @observable flags: GuildMemberFlags;
  @observable pending?: boolean | undefined;
  @observable communication_disabled_until?: string | null | undefined;

  constructor(
    domain: DomainStore,
    guild: Guild,
    data: APIGuildMember | GatewayGuildMemberListUpdateMember,
  ) {
    super();
    this.domain = domain;
    this.guild = guild;

    this.user = data.user;
    this.nick = data.nick;
    this.avatar = data.avatar;
    this.roles = data.roles
      .map(role => guild.roles.get(role))
      .filter(Boolean) as Role[];
    this.joined_at = data.joined_at;
    this.premium_since = data.premium_since;
    this.deaf = data.deaf;
    this.mute = data.mute;
    this.flags = data.flags;
    this.pending = data.pending;
    this.communication_disabled_until = data.communication_disabled_until;

    if ('presence' in data) {
      // TODO:
      this.domain.presences.add(data.presence);
    }
  }

  @action
  update(member: APIGuildMember | GatewayGuildMemberListUpdateMember) {
    Object.assign(this, member);

    if ('presence' in member) {
      // TODO:
      this.domain.presences.add(member.presence);
    }
  }
}
