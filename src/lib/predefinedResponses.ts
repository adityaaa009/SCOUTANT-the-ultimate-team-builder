
/**
 * Static data for predefined team compositions
 */

/**
 * Predefined team compositions for various scenarios
 */
export const predefinedTeamCompositions = {
  // Team with exceptional stats - for "Give me a team with crazy stats" query
  crazyStats: {
    success: true,
    lineup: [
      {
        name: "TenZ",
        agent: "Jett",
        role: "Duelist",
        confidence: 0.95,
        stats: {
          acs: 285,
          kd: 1.35,
          adr: 178,
          kast: "77%"
        },
        analysis: "Exceptional mechanical skill and movement, perfect for entry fragging and creating space"
      },
      {
        name: "ShahZaM",
        agent: "Sova",
        role: "Initiator",
        confidence: 0.92,
        stats: {
          acs: 248,
          kd: 1.22,
          adr: 165,
          kast: "82%"
        },
        analysis: "Strong with recon abilities and has excellent game sense as IGL"
      },
      {
        name: "nAts",
        agent: "Cypher",
        role: "Sentinel",
        confidence: 0.94,
        stats: {
          acs: 252,
          kd: 1.28,
          adr: 162,
          kast: "84%"
        },
        analysis: "Exceptional lurker with high impact in clutch situations"
      },
      {
        name: "cNed",
        agent: "Chamber",
        role: "Sentinel",
        confidence: 0.96,
        stats: {
          acs: 275,
          kd: 1.32,
          adr: 170,
          kast: "76%"
        },
        analysis: "Outstanding AWP/Operator player with excellent positioning"
      },
      {
        name: "Boaster",
        agent: "Astra",
        role: "Controller",
        confidence: 0.93,
        stats: {
          acs: 230,
          kd: 1.15,
          adr: 152,
          kast: "85%"
        },
        analysis: "Strategic IGL with exceptional utility usage and team coordination"
      }
    ],
    teamAnalysis: "This composition features players with exceptional statistical performance and mechanical skill. The lineup balances fragging power with strategic utility, providing strong site execution and defensive capabilities."
  },
  
  // Defensive team - for "Best team for playing defensive" query
  defensive: {
    success: true,
    lineup: [
      {
        name: "Chronicle",
        agent: "Sage",
        role: "Sentinel",
        confidence: 0.94,
        stats: {
          acs: 232,
          kd: 1.18,
          adr: 145,
          kast: "80%"
        },
        analysis: "Strong anchor player with healing and stalling abilities"
      },
      {
        name: "nAts",
        agent: "Killjoy",
        role: "Sentinel",
        confidence: 0.97,
        stats: {
          acs: 245,
          kd: 1.24,
          adr: 158,
          kast: "83%"
        },
        analysis: "Exceptional site anchor with strong post-plant capabilities"
      },
      {
        name: "Marved",
        agent: "Viper",
        role: "Controller",
        confidence: 0.92,
        stats: {
          acs: 225,
          kd: 1.12,
          adr: 155,
          kast: "78%"
        },
        analysis: "Strong area denial and stalling capabilities"
      },
      {
        name: "Soulcas",
        agent: "Sova",
        role: "Initiator",
        confidence: 0.90,
        stats: {
          acs: 220,
          kd: 1.05,
          adr: 152,
          kast: "82%"
        },
        analysis: "Information gathering specialist to anticipate pushes"
      },
      {
        name: "Derke",
        agent: "Chamber",
        role: "Sentinel",
        confidence: 0.95,
        stats: {
          acs: 265,
          kd: 1.28,
          adr: 162,
          kast: "76%"
        },
        analysis: "High-impact Operator player capable of holding angles and securing kills"
      }
    ],
    teamAnalysis: "This defensive-oriented lineup features multiple sentinels and strong area denial capabilities. The composition excels at site anchoring, retakes, and information gathering to counter enemy pushes."
  },
  
  // Offensive team - for "Best team for playing offensive" query
  offensive: {
    success: true,
    lineup: [
      {
        name: "Asuna",
        agent: "Raze",
        role: "Duelist",
        confidence: 0.96,
        stats: {
          acs: 275,
          kd: 1.30,
          adr: 172,
          kast: "76%"
        },
        analysis: "Aggressive entry fragger with explosive site-taking ability"
      },
      {
        name: "TenZ",
        agent: "Jett",
        role: "Duelist",
        confidence: 0.97,
        stats: {
          acs: 285,
          kd: 1.35,
          adr: 178,
          kast: "74%"
        },
        analysis: "Exceptional mechanical skill and movement for creating space"
      },
      {
        name: "Crashies",
        agent: "Breach",
        role: "Initiator",
        confidence: 0.93,
        stats: {
          acs: 230,
          kd: 1.12,
          adr: 160,
          kast: "79%"
        },
        analysis: "Flash and stun utility perfect for site executes"
      },
      {
        name: "Shao",
        agent: "Skye",
        role: "Initiator",
        confidence: 0.92,
        stats: {
          acs: 235,
          kd: 1.15,
          adr: 155,
          kast: "81%"
        },
        analysis: "Information gathering and flash support for entries"
      },
      {
        name: "Boaster",
        agent: "Omen",
        role: "Controller",
        confidence: 0.91,
        stats: {
          acs: 220,
          kd: 1.10,
          adr: 148,
          kast: "82%"
        },
        analysis: "Strategic smoke placement and teleport plays for map control"
      }
    ],
    teamAnalysis: "This aggressive composition focuses on fast site executions and space creation with double duelist setup. Strong flash support from initiators enables effective entry, while strategic smoke deployment creates advantageous engagements."
  },
  
  // Balanced team - default fallback
  balanced: {
    success: true,
    lineup: [
      {
        name: "yay",
        agent: "Chamber", 
        role: "Sentinel",
        confidence: 0.94,
        stats: {
          acs: 270,
          kd: 1.30,
          adr: 166,
          kast: "78%"
        },
        analysis: "Excellent Operator player with high mechanical skill"
      },
      {
        name: "crashies",
        agent: "Sova",
        role: "Initiator",
        confidence: 0.92,
        stats: {
          acs: 230,
          kd: 1.15,
          adr: 152,
          kast: "82%"
        },
        analysis: "Strong information gathering and support player"
      },
      {
        name: "Asuna",
        agent: "Raze",
        role: "Duelist",
        confidence: 0.93,
        stats: {
          acs: 255,
          kd: 1.22,
          adr: 165,
          kast: "75%"
        },
        analysis: "Aggressive entry fragger with high impact"
      },
      {
        name: "Marved",
        agent: "Omen",
        role: "Controller",
        confidence: 0.91,
        stats: {
          acs: 225,
          kd: 1.08,
          adr: 150,
          kast: "80%"
        },
        analysis: "Strategic smoke controller with map presence"
      },
      {
        name: "FNS",
        agent: "Sage",
        role: "Sentinel",
        confidence: 0.90,
        stats: {
          acs: 215,
          kd: 0.95,
          adr: 135,
          kast: "85%"
        },
        analysis: "Tactical IGL with strong support capabilities"
      }
    ],
    teamAnalysis: "This well-balanced composition provides a mix of aggressive entry potential, information gathering, site control, and defensive capability. The lineup has synergistic agent abilities and covers all essential roles."
  },
  
  // Map-specific compositions
  maps: {
    "ascent": {
      success: true,
      lineup: [
        {
          name: "ScreaM",
          agent: "Jett",
          role: "Duelist",
          confidence: 0.93,
          stats: {
            acs: 265,
            kd: 1.28,
            adr: 168,
            kast: "75%"
          },
          analysis: "Exceptional aimer who can control mid with Operator"
        },
        {
          name: "Boaster",
          agent: "Omen",
          role: "Controller",
          confidence: 0.94,
          stats: {
            acs: 225,
            kd: 1.12,
            adr: 145,
            kast: "82%"
          },
          analysis: "Strategic smoke placement for site executes"
        },
        {
          name: "nAts",
          agent: "Killjoy",
          role: "Sentinel",
          confidence: 0.96,
          stats: {
            acs: 240,
            kd: 1.20,
            adr: 155,
            kast: "84%"
          },
          analysis: "Strong B site anchor with post-plant utility"
        },
        {
          name: "Shao",
          agent: "Fade",
          role: "Initiator",
          confidence: 0.92,
          stats: {
            acs: 235,
            kd: 1.15,
            adr: 150,
            kast: "80%"
          },
          analysis: "Information gathering to support executes"
        },
        {
          name: "Derke",
          agent: "Chamber",
          role: "Sentinel",
          confidence: 0.91,
          stats: {
            acs: 255,
            kd: 1.25,
            adr: 160,
            kast: "76%"
          },
          analysis: "Strong anchor with Operator capability"
        }
      ],
      teamAnalysis: "This composition excels on Ascent with strong mid control capabilities and site anchoring. Killjoy provides excellent B site control while Chamber and Jett can contest A main and mid."
    },
    "bind": {
      success: true,
      lineup: [
        {
          name: "Asuna",
          agent: "Raze",
          role: "Duelist",
          confidence: 0.95,
          stats: {
            acs: 270,
            kd: 1.27,
            adr: 170,
            kast: "74%"
          },
          analysis: "Explosives perfect for clearing hookah and tight spaces"
        },
        {
          name: "Marved",
          agent: "Brimstone",
          role: "Controller",
          confidence: 0.94,
          stats: {
            acs: 230,
            kd: 1.12,
            adr: 155,
            kast: "79%"
          },
          analysis: "Precision smokes for site executes"
        },
        {
          name: "FNS",
          agent: "Cypher",
          role: "Sentinel",
          confidence: 0.93,
          stats: {
            acs: 215,
            kd: 1.08,
            adr: 140,
            kast: "83%"
          },
          analysis: "Flank watch and information gathering"
        },
        {
          name: "crashies",
          agent: "Skye",
          role: "Initiator",
          confidence: 0.92,
          stats: {
            acs: 235,
            kd: 1.14,
            adr: 158,
            kast: "80%"
          },
          analysis: "Flash support for site executes"
        },
        {
          name: "Laz",
          agent: "Viper",
          role: "Controller",
          confidence: 0.91,
          stats: {
            acs: 220,
            kd: 1.10,
            adr: 145,
            kast: "81%"
          },
          analysis: "Wall for site splits and post-plant control"
        }
      ],
      teamAnalysis: "This Bind composition features strong utility for clearing tight spaces and double controller setup for better site executes. Cypher provides crucial flank watch on a map with many flanking routes."
    },
    "haven": {
      success: true,
      lineup: [
        {
          name: "yay",
          agent: "Jett",
          role: "Duelist",
          confidence: 0.94,
          stats: {
            acs: 275,
            kd: 1.32,
            adr: 172,
            kast: "76%"
          },
          analysis: "Mobile Operator player for quick rotations"
        },
        {
          name: "Soulcas",
          agent: "Astra",
          role: "Controller",
          confidence: 0.95,
          stats: {
            acs: 225,
            kd: 1.10,
            adr: 150,
            kast: "82%"
          },
          analysis: "Global presence for controlling all three sites"
        },
        {
          name: "nAts",
          agent: "Killjoy",
          role: "Sentinel",
          confidence: 0.93,
          stats: {
            acs: 245,
            kd: 1.20,
            adr: 158,
            kast: "81%"
          },
          analysis: "Strong C site anchor"
        },
        {
          name: "Shao",
          agent: "Breach",
          role: "Initiator",
          confidence: 0.92,
          stats: {
            acs: 235,
            kd: 1.15,
            adr: 160,
            kast: "79%"
          },
          analysis: "Flash and stun support for executes"
        },
        {
          name: "ScreaM",
          agent: "Phoenix",
          role: "Duelist",
          confidence: 0.90,
          stats: {
            acs: 250,
            kd: 1.22,
            adr: 165,
            kast: "75%"
          },
          analysis: "Self-sufficient entry with flash and heal"
        }
      ],
      teamAnalysis: "This Haven composition focuses on map control and fast rotations between the three sites. The double duelist setup provides entry power while Astra offers global utility presence."
    },
    "breeze": {
      success: true,
      lineup: [
        {
          name: "cNed",
          agent: "Jett",
          role: "Duelist",
          confidence: 0.96,
          stats: {
            acs: 270,
            kd: 1.30,
            adr: 168,
            kast: "76%"
          },
          analysis: "Elite Operator player for long sightlines"
        },
        {
          name: "Marved",
          agent: "Viper",
          role: "Controller",
          confidence: 0.97,
          stats: {
            acs: 230,
            kd: 1.12,
            adr: 155,
            kast: "79%"
          },
          analysis: "Essential wall for site splits"
        },
        {
          name: "yay",
          agent: "Chamber",
          role: "Sentinel",
          confidence: 0.95,
          stats: {
            acs: 265,
            kd: 1.28,
            adr: 165,
            kast: "77%"
          },
          analysis: "Teleport for repositioning and Operator play"
        },
        {
          name: "crashies",
          agent: "Sova",
          role: "Initiator",
          confidence: 0.94,
          stats: {
            acs: 240,
            kd: 1.18,
            adr: 158,
            kast: "81%"
          },
          analysis: "Recon for large open areas"
        },
        {
          name: "Mazino",
          agent: "Fade",
          role: "Initiator",
          confidence: 0.92,
          stats: {
            acs: 235,
            kd: 1.15,
            adr: 152,
            kast: "80%"
          },
          analysis: "Multi-target reveals for site executes"
        }
      ],
      teamAnalysis: "This Breeze composition addresses the map's long sightlines with strong Operator players and essential Viper utility. Double initiator setup provides crucial information on this large, open map."
    },
    "split": {
      success: true,
      lineup: [
        {
          name: "Asuna",
          agent: "Raze",
          role: "Duelist",
          confidence: 0.95,
          stats: {
            acs: 265,
            kd: 1.27,
            adr: 170,
            kast: "75%"
          },
          analysis: "Explosives perfect for clearing tight corners"
        },
        {
          name: "Boaster",
          agent: "Omen",
          role: "Controller",
          confidence: 0.93,
          stats: {
            acs: 225,
            kd: 1.12,
            adr: 150,
            kast: "81%"
          },
          analysis: "Strategic smokes and teleports for map control"
        },
        {
          name: "Chronicle",
          agent: "Sage",
          role: "Sentinel",
          confidence: 0.94,
          stats: {
            acs: 230,
            kd: 1.14,
            adr: 145,
            kast: "83%"
          },
          analysis: "Wall essential for mid control"
        },
        {
          name: "Shao",
          agent: "Breach",
          role: "Initiator",
          confidence: 0.92,
          stats: {
            acs: 240,
            kd: 1.15,
            adr: 155,
            kast: "79%"
          },
          analysis: "Stuns and flashes for tight corridors"
        },
        {
          name: "nAts",
          agent: "Cypher",
          role: "Sentinel",
          confidence: 0.91,
          stats: {
            acs: 235,
            kd: 1.18,
            adr: 148,
            kast: "82%"
          },
          analysis: "Trip wires for flank watch in many choke points"
        }
      ],
      teamAnalysis: "This Split composition features double sentinel setup for strong defensive capabilities and mid control. Raze and Breach provide excellent utility for clearing tight spaces during executes."
    }
  }
};
