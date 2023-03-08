import {
  APIChannel,
  APIInvite,
  APIOverwrite,
  APIReadState,
  APIUser,
  APIWebhook,
  GatewayVoiceState,
  Snowflake,
} from '@puyodead1/fosscord-api-types/v9';
import {action, makeObservable} from 'mobx';
import BaseStore from '../BaseStore';
import MessageStore from '../MessageStore';

export default class Channel extends BaseStore {
  id: Snowflake;
  createdAt: string;
  name?: string;
  icon?: string | null;
  type: number;
  recipients?: APIUser[];
  lastMessageId?: Snowflake;
  guildId?: Snowflake;
  parentId: Snowflake;
  ownerId?: Snowflake;
  lastPinTimestamp?: number;
  defaultAutoArchiveDuration?: number;
  position?: number;
  permissionOverwrites?: APIOverwrite[];
  videoQualityMode?: number;
  bitrate?: number;
  userLimit?: number;
  nsfw: boolean;
  rateLimiTPerUser?: number;
  topic?: string;
  invites?: APIInvite[];
  retentionPolicyId?: string;
  messages = new MessageStore();
  voiceStates?: GatewayVoiceState[];
  readStates?: APIReadState[];
  webhooks?: APIWebhook[];
  flags: number;
  defaultThreadRateLimitPerUser: number;

  constructor(channel: APIChannel) {
    super();

    this.id = channel.id;
    this.createdAt = channel.created_at;
    this.name = channel.name;
    this.icon = channel.icon;
    this.type = channel.type;
    this.recipients = channel.recipients;
    this.lastMessageId = channel.last_message_id;
    this.guildId = channel.guild_id;
    this.parentId = channel.parent_id;
    this.ownerId = channel.owner_id;
    this.lastPinTimestamp = channel.last_pin_timestamp;
    this.defaultAutoArchiveDuration = channel.default_auto_archive_duration;
    this.position = channel.position;
    this.permissionOverwrites = channel.permission_overwrites;
    this.videoQualityMode = channel.video_quality_mode;
    this.bitrate = channel.bitrate;
    this.userLimit = channel.user_limit;
    this.nsfw = channel.nsfw;
    this.rateLimiTPerUser = channel.rate_limit_per_user;
    this.topic = channel.topic;
    this.invites = channel.invites;
    this.retentionPolicyId = channel.retention_policy_id;
    this.voiceStates = channel.voice_states;
    this.readStates = channel.read_states;
    this.webhooks = channel.webhooks;
    this.flags = channel.flags;
    this.defaultThreadRateLimitPerUser =
      channel.default_thread_rate_limit_per_user;

    if (channel.messages) {
      this.messages.addAll(channel.messages);
    }

    makeObservable(this);
  }

  @action
  update(data: APIChannel) {
    Object.assign(this, data);
  }
}