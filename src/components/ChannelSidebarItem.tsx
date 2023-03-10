import {ChannelType} from '@puyodead1/fosscord-api-types/v9';
import {useNavigation} from '@react-navigation/native';
import {t} from 'i18next';
import {observer} from 'mobx-react-lite';
import React from 'react';
import {Animated, Platform, Pressable, StyleSheet} from 'react-native';
import {Avatar, HelperText, Text, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useLogger from '../hooks/useLogger';
import Channel from '../stores/objects/Channel';
import {CustomTheme} from '../types';
import {CDNRoutes, DefaultUserAvatarAssets} from '../utils/Endpoints';
import REST from '../utils/REST';
import Container from './Container';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const ANIMATION_TIME = 100; // the duration of the hover animation

interface Props {
  channel: Channel;
}

function PrivateChannelItem({channel}: Props) {
  const logger = useLogger('PrivateChannelItem');
  const theme = useTheme<CustomTheme>();
  const navigation = useNavigation();
  const [bgColor] = React.useState(new Animated.Value(0));

  if (!channel.recipients) {
    logger.warn('channel.recipients is undefined');
    return null;
  }

  const user = channel.recipients[0];
  const avatarUrl =
    channel.type === ChannelType.GroupDM
      ? undefined
      : user.avatar
      ? REST.makeCDNUrl(CDNRoutes.userAvatar(user.id, user.avatar))
      : REST.makeCDNUrl(
          CDNRoutes.defaultUserAvatar(
            (Number(user.discriminator) % 5) as DefaultUserAvatarAssets,
          ),
        );

  const onHoverIn = () => {
    if (!Platform.isWeb) {
      return;
    }
    Animated.timing(bgColor, {
      toValue: 1,
      duration: ANIMATION_TIME,
      useNativeDriver: false,
    }).start();
  };

  const onHoverOut = () => {
    if (!Platform.isWeb) {
      return;
    }
    Animated.timing(bgColor, {
      toValue: 0,
      duration: ANIMATION_TIME,
      useNativeDriver: false,
    }).start();
  };

  const onPress = () => {
    navigation.setParams({
      guildId: 'me',
      channelId: channel.id,
    } as any);
  };

  return (
    <AnimatedPressable
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onPress={onPress}
      style={[
        styles.pressable,
        styles.pressablePM,
        {
          backgroundColor: bgColor.interpolate({
            inputRange: [0, 1],
            outputRange: [
              theme.colors.palette.background60,
              theme.colors.palette.background80,
            ],
          }),
        },
      ]}>
      <Container row horizontalCenter>
        {avatarUrl ? (
          <Avatar.Image
            source={{uri: avatarUrl}}
            size={32}
            style={{marginRight: 10, backgroundColor: 'transparent'}}
          />
        ) : (
          <Avatar.Icon
            icon="account-multiple"
            size={32}
            color={theme.colors.whiteBlack}
            style={{
              marginRight: 10,
              backgroundColor: theme.colors.palette.red50,
            }}
          />
        )}
        <Container>
          <Text
            variant="bodySmall"
            style={{color: theme.colors.palette.gray100}}>
            {channel.type === ChannelType.GroupDM
              ? channel.recipients.map(x => x.username).join(', ')
              : user.username}
          </Text>
          {channel.type === ChannelType.GroupDM && (
            <HelperText
              type="info"
              padding="none"
              variant="bodySmall"
              visible
              style={{color: theme.colors.palette.gray100}}>
              {t('channel:GROUP_DM_MEMBER_COUNT', {
                count: channel.recipients.length,
              })}
            </HelperText>
          )}
        </Container>
      </Container>
    </AnimatedPressable>
  );
}

function ChannelSidebarItem({channel}: Props) {
  const logger = useLogger('ChannelSidebarItem');
  const theme = useTheme<CustomTheme>();
  const navigation = useNavigation();
  const [bgColor] = React.useState(new Animated.Value(0));

  if ([ChannelType.DM, ChannelType.GroupDM].includes(channel.type)) {
    return <PrivateChannelItem channel={channel} />;
  }

  const onHoverIn = () => {
    if (!Platform.isWeb) {
      return;
    }
    Animated.timing(bgColor, {
      toValue: 1,
      duration: ANIMATION_TIME,
      useNativeDriver: false,
    }).start();
  };

  const onHoverOut = () => {
    if (!Platform.isWeb) {
      return;
    }
    Animated.timing(bgColor, {
      toValue: 0,
      duration: ANIMATION_TIME,
      useNativeDriver: false,
    }).start();
  };

  const onPress = () => {
    // ignore non-text based channels
    // TODO: make this nicer
    // TODO: do something with these other channel types
    if (
      [
        ChannelType.DM,
        ChannelType.GroupDM,
        ChannelType.VoicelessWhiteboard,
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
        ChannelType.GuildCategory,
        ChannelType.GuildDirectory,
        ChannelType.GuildStore,
      ].includes(channel.type)
    ) {
      return;
    }

    navigation.navigate('App', {
      screen: 'Channel',
      params: {
        guildId: channel.guildId!,
        channelId: channel.id,
      },
    });
  };

  return (
    <AnimatedPressable
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onPress={onPress}
      style={[
        styles.pressable,
        {
          backgroundColor: bgColor.interpolate({
            inputRange: [0, 1],
            outputRange: [
              theme.colors.palette.background60,
              theme.colors.palette.background80,
            ],
          }),
        },
      ]}>
      <Container row horizontalCenter style={styles.container}>
        {channel.channelIcon && (
          <Icon
            name={channel.channelIcon! as any}
            size={16}
            color={theme.colors.palette.gray80}
            style={{marginRight: 5}}
          />
        )}
        <Container>
          <Text
            variant="bodyMedium"
            style={{color: theme.colors.palette.gray80}}>
            {channel.name}
          </Text>
        </Container>
      </Container>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    paddingHorizontal: 8,
    borderRadius: 5,
    height: 33,
    justifyContent: 'center',
  },
  pressablePM: {
    paddingVertical: 1,
    height: 44,
    justifyContent: 'center',
  },
  container: {paddingVertical: 6},
  icon: {
    backgroundColor: 'transparent',
  },
});

export default observer(ChannelSidebarItem);
