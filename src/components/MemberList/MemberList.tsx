import {observer} from 'mobx-react-lite';
import React from 'react';
import {Platform, SectionList} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {CustomTheme} from '../../constants/Colors';
import {DomainContext} from '../../stores/DomainStore';
import Channel from '../../stores/objects/Channel';
import Guild from '../../stores/objects/Guild';
import Container from '../Container';

interface Props {
  guild: Guild;
  channel: Channel;
}

// TODO: user avatar and status
// TODO: user activity
function MemberList({guild, channel}: Props) {
  const theme = useTheme<CustomTheme>();
  const domain = React.useContext(DomainContext);

  React.useEffect(() => {
    domain.gateway.onChannelOpen(guild.id, channel.id);
  }, [guild]);

  return (
    <SectionList
      sections={guild.memberList?.listData || []}
      keyExtractor={(item, index) => index + item.user?.id!}
      renderItem={({item}) => {
        const highestRoleId = item.roles[0];
        const role = highestRoleId ? guild.roles.get(highestRoleId) : undefined;
        const colorStyle = role ? {color: role.color} : {};

        // TODO: get member presence and set opacity (~0.2) for offline members
        return (
          <Container>
            <Text style={colorStyle}>{item.user?.username}</Text>
          </Container>
        );
      }}
      renderSectionHeader={({section: {title}}) => (
        <Container
          style={{
            backgroundColor: Platform.isMobile
              ? theme.colors.palette.backgroundPrimary100
              : theme.colors.palette.backgroundPrimary70,
            paddingTop: 10,
          }}>
          <Text
            style={{
              color: theme.colors.textMuted,
            }}>
            {title}
          </Text>
        </Container>
      )}
      stickySectionHeadersEnabled={Platform.isMobile}
      contentContainerStyle={{padding: 10}}
    />
  );
}

export default observer(MemberList);
