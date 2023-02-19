import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RESTPostAPIChannelMessageJSONBody } from "@puyodead1/fosscord-api-types/v9";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { observer } from "mobx-react";
import React from "react";
import {
  Animated,
  FlatList,
  GestureResponderEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  IconButton,
  Text,
  TextInput as TextInputPaper,
  useTheme,
} from "react-native-paper";
import ChannelsSidebarMobile from "../components/ChannelsSidebarMobile";
import ChatMessage from "../components/ChatMessage";
import Container from "../components/Container";
import GuildListGuild from "../components/GuildListGuildItem";
import GuildSidebarMobile from "../components/GuildSidebarMobile";
import MembersListMobile from "../components/MembersListMobile";
import BottomTabBar from "../components/ReactNavigationBottomTabs/views/BottomTabBar";
import Swiper from "../components/Swiper";
import { CustomTheme } from "../constants/Colors";
import { DefaultRouteSettings, Globals } from "../constants/Globals";
import BottomTabBarProgressContext from "../contexts/BottomTabBarProgressContext";
import useChannel from "../hooks/useChannel";
import useGuild from "../hooks/useGuild";
import { DomainContext } from "../stores/DomainStore";
import {
  ChannelsParamList,
  ChannelsStackScreenProps,
  RootStackScreenProps,
} from "../types";
import { Routes } from "../utils/Endpoints";

const Stack = createNativeStackNavigator<ChannelsParamList>();
const Tab = createBottomTabNavigator<ChannelsParamList>();

const ChannelDesktop = observer(
  ({
    route: {
      params: { guildId, channelId },
    },
    navigation,
  }: ChannelsStackScreenProps<"Channel">) => {
    const theme = useTheme<CustomTheme>();
    const domain = React.useContext(DomainContext);
    const guild = useGuild(guildId, domain);
    const channel = useChannel(guildId, channelId, domain);
    const [routeSettings, setRouteSettings] = React.useState(
      Globals.routeSettings
    );

    const [message, setMessage] = React.useState("");

    React.useEffect(() => {
      if (!channel) return;
      // get the first channel in the guild and update the route params
      channelId = channel.id;
      navigation.dispatch(CommonActions.setParams({ channelId: channel.id }));

      domain.gateway.onChannelOpen(guildId, channelId);

      channel.getChannelMessages(domain, 50).catch(console.error);
    }, [channelId, channel]);

    const onSettingChange = (key: keyof typeof Globals.routeSettings) => {
      return async (value: any) => {
        setRouteSettings({ ...routeSettings, [key]: value });
        Globals.routeSettings[key] = value;
        await Globals.save();
      };
    };

    if (!guild) {
      return (
        <Container>
          <Text>Guild not found</Text>
          <Container style={{ margin: 10 }}>
            <TextInputPaper
              label="API URL"
              value={routeSettings.api}
              placeholder={DefaultRouteSettings.api}
              onChangeText={onSettingChange("api")}
              style={{ marginVertical: 10 }}
            />
            <TextInputPaper
              label="CDN URL"
              value={routeSettings.cdn}
              placeholder={DefaultRouteSettings.cdn}
              onChangeText={onSettingChange("cdn")}
              style={{ marginVertical: 10 }}
            />
            <TextInputPaper
              label="Gateway URL"
              value={routeSettings.gateway}
              placeholder={DefaultRouteSettings.gateway}
              onChangeText={onSettingChange("gateway")}
              style={{ marginVertical: 10 }}
            />
            <TextInputPaper
              label="Invite URL"
              value={routeSettings.invite}
              placeholder={DefaultRouteSettings.invite}
              onChangeText={onSettingChange("invite")}
              style={{ marginVertical: 10 }}
            />
            <TextInputPaper
              label="Template URL"
              value={routeSettings.template}
              placeholder={DefaultRouteSettings.template}
              onChangeText={onSettingChange("template")}
              style={{ marginVertical: 10 }}
            />
            <TextInputPaper
              label="Gift URL"
              value={routeSettings.gift}
              placeholder={DefaultRouteSettings.gift}
              onChangeText={onSettingChange("gift")}
              style={{ marginVertical: 10 }}
            />
            <TextInputPaper
              label="Scheduled Event URL"
              value={routeSettings.scheduledEvent}
              placeholder={DefaultRouteSettings.scheduledEvent}
              onChangeText={onSettingChange("scheduledEvent")}
              style={{ marginVertical: 10 }}
            />
          </Container>
          <Button
            mode="contained"
            buttonColor={theme.colors.error}
            onPress={() => {
              domain.account.logout();
            }}
          >
            Logout
          </Button>
        </Container>
      );
    }

    if (!channel) {
      return (
        <Container>
          <Text>
            Could not find channel by id, or could not get the first channel in
            the guild
          </Text>
        </Container>
      );
    }

    const handleSendMessage = (
      e: NativeSyntheticEvent<TextInputKeyPressEventData>
    ) => {
      // @ts-ignore
      if (e.which === 13 && !e.shiftKey) {
        // send message
        e.preventDefault();

        // check if the message is empty, contains only spaces, or contains only newlines
        if (!message || !message.trim() || !message.replace(/\r?\n|\r/g, ""))
          return;
        domain.rest
          .post<RESTPostAPIChannelMessageJSONBody, any>(
            Routes.channelMessages(channel.id),
            {
              content: message,
              nonce: Date.now().toString(),
            }
          )
          .then(() => {
            setMessage("");
          });
      }
    };

    return (
      <Container verticalCenter horizontalCenter flexOne displayFlex row>
        <Container
          testID="channelSidebar"
          style={{
            backgroundColor: theme.colors.palette.backgroundPrimary70,
            height: "100%",
            width: 240,
          }}
        >
          <Container testID="channelsWrapper" displayFlex flexOne>
            <Container
              testID="channelHeader"
              verticalCenter
              horizontalCenter
              style={{
                height: 48,
                backgroundColor: theme.colors.palette.backgroundPrimary70,
              }}
              isSurface
              elevation={1}
            >
              <Text>{guild.name}</Text>
            </Container>
            <Container displayFlex flexOne>
              <ScrollView>
                <SectionList
                  sections={guild.channelList}
                  keyExtractor={(item, index) => item.id + index}
                  renderItem={({ item }) => (
                    <Container
                      row
                      horizontalCenter
                      style={{ marginHorizontal: 10, padding: 2 }}
                    >
                      {item.channelIcon && (
                        <MaterialCommunityIcons
                          name={item.channelIcon! as any}
                          size={16}
                          color={theme.colors.textMuted}
                          style={{ marginRight: 5 }}
                        />
                      )}
                      <Text
                        variant="bodyMedium"
                        style={{ color: theme.colors.textMuted }}
                      >
                        {item.name}
                      </Text>
                    </Container>
                  )}
                  renderSectionHeader={({ section: { title } }) => {
                    if (!title) return null;
                    return (
                      <View
                        style={{
                          backgroundColor:
                            theme.colors.palette.backgroundPrimary70,
                          marginTop: 20,
                        }}
                      >
                        <Text>{title.toUpperCase()}</Text>
                      </View>
                    );
                  }}
                  stickySectionHeadersEnabled={true}
                  contentContainerStyle={{ padding: 10 }}
                />
              </ScrollView>
            </Container>
          </Container>
          <Container
            testID="channelFooter"
            style={{
              backgroundColor: theme.colors.palette.backgroundPrimary50,
            }}
          >
            <Container
              testID="userActions"
              displayFlex
              row
              horizontalCenter
              style={{
                height: 52,
                paddingVertical: 8,
                backgroundColor: "transparent",
              }}
            >
              <Container style={{ marginHorizontal: 8 }}>
                <Avatar.Image
                  size={32}
                  source={{ uri: domain.account.user?.avatarURL }}
                />
              </Container>
              <Container>
                <Text>
                  {domain.account.user?.username}#
                  {domain.account.user?.discriminator}
                </Text>
              </Container>
            </Container>
          </Container>
        </Container>

        <Container
          testID="chatContainer"
          style={{
            height: "100%",
            backgroundColor: theme.colors.palette.backgroundPrimary100,
          }}
          displayFlex
          flexOne
        >
          <Container
            testID="chatHeader"
            verticalCenter
            style={{
              height: 48,
              paddingHorizontal: 10,
              backgroundColor: theme.colors.palette.backgroundPrimary100,
            }}
            isSurface
            elevation={1}
          >
            <Text>#{channel.name}</Text>
          </Container>
          <Container testID="chat" displayFlex flexOne row>
            <Container testID="chatContent" displayFlex flexOne>
              <FlatList
                data={channel.messages.asList().reverse()}
                renderItem={({ item }) => <ChatMessage message={item} />}
                keyExtractor={(item) => item.id}
                inverted={true}
              />
              <Container
                testID="chatInput"
                style={{
                  paddingHorizontal: 16,
                  marginBottom: 24,
                  maxHeight: "50vh",
                }}
              >
                <TextInput
                  placeholder={`Message #${channel?.name}`}
                  value={message}
                  onChangeText={(message) => setMessage(message)}
                  editable
                  multiline
                  style={{
                    backgroundColor: theme.colors.palette.backgroundPrimary80,
                    color: theme.colors.whiteBlack,
                    padding: 10,
                    borderRadius: 10,
                    // @ts-ignore
                    outlineStyle: "none",
                  }}
                  placeholderTextColor={theme.colors.text}
                  spellCheck={false}
                  onKeyPress={handleSendMessage}
                />
              </Container>
            </Container>
            <Container
              testID="memberList"
              style={{
                width: 240,
                backgroundColor: theme.colors.palette.backgroundPrimary70,
              }}
              displayFlex
            >
              <SectionList
                sections={guild.memberList?.listData || []}
                keyExtractor={(item, index) => index + item.user?.id!}
                renderItem={({ item }) => (
                  <View>
                    <Text>{item.user?.username}</Text>
                  </View>
                )}
                renderSectionHeader={({ section: { title } }) => (
                  <View
                    style={{
                      backgroundColor: theme.colors.palette.backgroundPrimary70,
                      paddingTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.textMuted,
                      }}
                    >
                      {title}
                    </Text>
                  </View>
                )}
                contentContainerStyle={{ padding: 10 }}
              />
            </Container>
          </Container>
        </Container>
      </Container>
    );
  }
);

const ChannelsScreenDesktop = observer(
  ({ navigation }: RootStackScreenProps<"Channels">) => {
    const domain = React.useContext(DomainContext);
    const theme = useTheme<CustomTheme>();

    return (
      <Container verticalCenter horizontalCenter flexOne displayFlex row>
        <Container
          testID="guildsList"
          style={{
            height: "100%",
            backgroundColor: theme.colors.palette.backgroundPrimary40,
            width: 72,
            zIndex: 3,
          }}
          displayFlex
          horizontalCenter
        >
          <ScrollView style={{ overflow: "visible" }}>
            <Pressable
              onPress={() => {
                navigation.navigate("Channels", {
                  screen: "Channel",
                  params: { guildId: "me" },
                });
              }}
            >
              <Avatar.Icon icon="home" size={48} />
            </Pressable>

            <Container
              testID="guildListGuildIconContainer"
              style={{ overflow: "visible" }}
            >
              {domain.guilds.asList().map((guild) => {
                return (
                  <GuildListGuild
                    key={guild.id}
                    guild={guild}
                    onPress={() => {
                      navigation.navigate("Channels", {
                        screen: "Channel",
                        params: { guildId: guild.id },
                      });
                    }}
                  />
                );
              })}
            </Container>
          </ScrollView>
        </Container>

        <Container
          testID="outerContainer"
          style={{ height: "100%" }}
          displayFlex
          flexOne
          row
        >
          <Stack.Navigator
            initialRouteName="Channel"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="Channel"
              component={ChannelDesktop}
              initialParams={{ guildId: "me" }}
            />
          </Stack.Navigator>
        </Container>
      </Container>
    );
  }
);

function SettingsMobile({ navigation }: ChannelsStackScreenProps<"Settings">) {
  const domain = React.useContext(DomainContext);
  const [routeSettings, setRouteSettings] = React.useState(
    Globals.routeSettings
  );

  const onSettingChange = (key: keyof typeof Globals.routeSettings) => {
    return async (value: any) => {
      setRouteSettings({ ...routeSettings, [key]: value });
      Globals.routeSettings[key] = value;
      await Globals.save();
    };
  };

  return (
    <Container isSafe>
      <Text>Settings</Text>
      <Button mode="contained" onPress={domain.toggleDarkTheme}>
        Toggle Theme
      </Button>
      <Container style={{ margin: 10 }}>
        <TextInputPaper
          label="API URL"
          value={routeSettings.api}
          placeholder={DefaultRouteSettings.api}
          onChangeText={onSettingChange("api")}
          style={{ marginVertical: 10 }}
        />
        <TextInputPaper
          label="CDN URL"
          value={routeSettings.cdn}
          placeholder={DefaultRouteSettings.cdn}
          onChangeText={onSettingChange("cdn")}
          style={{ marginVertical: 10 }}
        />
        <TextInputPaper
          label="Gateway URL"
          value={routeSettings.gateway}
          placeholder={DefaultRouteSettings.gateway}
          onChangeText={onSettingChange("gateway")}
          style={{ marginVertical: 10 }}
        />
        <TextInputPaper
          label="Invite URL"
          value={routeSettings.invite}
          placeholder={DefaultRouteSettings.invite}
          onChangeText={onSettingChange("invite")}
          style={{ marginVertical: 10 }}
        />
        <TextInputPaper
          label="Template URL"
          value={routeSettings.template}
          placeholder={DefaultRouteSettings.template}
          onChangeText={onSettingChange("template")}
          style={{ marginVertical: 10 }}
        />
        <TextInputPaper
          label="Gift URL"
          value={routeSettings.gift}
          placeholder={DefaultRouteSettings.gift}
          onChangeText={onSettingChange("gift")}
          style={{ marginVertical: 10 }}
        />
        <TextInputPaper
          label="Scheduled Event URL"
          value={routeSettings.scheduledEvent}
          placeholder={DefaultRouteSettings.scheduledEvent}
          onChangeText={onSettingChange("scheduledEvent")}
          style={{ marginVertical: 10 }}
        />
      </Container>
    </Container>
  );
}

/**
 * Main screen rendering for mobile
 */
const ChannelMobile = observer((props: ChannelsStackScreenProps<"Channel">) => {
  let { guildId, channelId } = props.route.params;

  const theme = useTheme<CustomTheme>();
  const domain = React.useContext(DomainContext);
  const guild = useGuild(guildId, domain);
  const channel = useChannel(guildId, channelId, domain);

  const [message, setMessage] = React.useState("");

  // handles selecting a channel and updating the url to include the channel id
  React.useEffect(() => {
    if (!channel) return;
    // get the first channel in the guild and update the route params
    channelId = channel.id;
    props.navigation.dispatch(
      CommonActions.setParams({ channelId: channel.id })
    );

    domain.gateway.onChannelOpen(guildId, channelId);

    channel.getChannelMessages(domain, 50).catch(console.error);
  }, [channelId, channel]);

  /**
   Constructs the Guild Sidebar and Channel list for the left side of the Swipper component
   */
  const leftAction = (
    <Container flexOne row>
      <GuildSidebarMobile {...props} />
      <ChannelsSidebarMobile guild={guild} />
    </Container>
  );

  /**
   * Constructs the Member list component for the right side of the swiper
   */
  const rightAction = <MembersListMobile guild={guild} />;

  const handleSendMessage = (e: GestureResponderEvent) => {
    // check if the message is empty, contains only spaces, or contains only newlines
    if (!message || !message.trim() || !message.replace(/\r?\n|\r/g, ""))
      return;
    domain.rest
      .post<RESTPostAPIChannelMessageJSONBody, any>(
        Routes.channelMessages(channelId!),
        {
          content: message,
          nonce: Date.now().toString(),
        }
      )
      .then(() => {
        setMessage("");
      });
  };

  return (
    <Swiper
      leftChildren={leftAction}
      rightChildren={rightAction}
      containerStyle={{
        backgroundColor: theme.colors.palette.backgroundPrimary40,
      }}
    >
      <Container
        flexOne
        style={{
          backgroundColor: theme.colors.palette.backgroundPrimary90,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        {!guild || !channel ? (
          <Text>AAAA</Text>
        ) : (
          <>
            <Container
              testID="chatHeader"
              style={{
                height: 48,
                padding: 10,
                backgroundColor: theme.colors.palette.backgroundPrimary60,
              }}
            >
              <Text>#{channel?.name}</Text>
            </Container>
            <FlatList
              data={channel?.messages.asList().reverse()}
              renderItem={({ item }) => <ChatMessage message={item} />}
              keyExtractor={(item) => item.id}
              inverted={true}
            />
            <Container
              testID="chatInput"
              style={{
                padding: 10,
              }}
            >
              <Container
                row
                horizontalCenter
                style={{
                  backgroundColor: theme.colors.palette.backgroundPrimary60,
                  borderRadius: 20,
                }}
              >
                <TextInput
                  placeholder={`Message #${channel?.name}`}
                  value={message}
                  onChangeText={(message) => setMessage(message)}
                  editable
                  multiline
                  style={{
                    backgroundColor: "transparent",
                    color: theme.colors.whiteBlack,
                    padding: 10,
                    flex: 1,
                  }}
                  placeholderTextColor={theme.colors.text}
                  spellCheck={false}
                />
                <IconButton icon="send" size={32} onPress={handleSendMessage} />
              </Container>
            </Container>
          </>
        )}
      </Container>
    </Swiper>
  );
});

const ChannelsScreenMobile = observer(() => {
  const theme = useTheme<CustomTheme>();

  return (
    <BottomTabBarProgressContext.Provider
      value={{
        progress: new Animated.Value(0),
        setProgress: (progress: number) => {},
      }}
    >
      <Tab.Navigator
        initialRouteName="Channel"
        screenOptions={{
          headerShown: false,
          // tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarStyle: {
            backgroundColor: theme.colors.palette.backgroundPrimary0,
          },
          tabBarShowLabel: false,
        }}
        tabBar={(props) => <BottomTabBar {...props} />}
      >
        <Tab.Screen
          name="Channel"
          component={ChannelMobile}
          initialParams={{ guildId: "me" }}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chat" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsMobile}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </BottomTabBarProgressContext.Provider>
  );
});

function ChannelsScreen(props: RootStackScreenProps<"Channels">) {
  const Element = Platform.isMobile
    ? ChannelsScreenMobile
    : ChannelsScreenDesktop;

  return <Element {...props} />;
}

export default observer(ChannelsScreen);
