-- Demo seed data for development

-- Demo agents
INSERT INTO agents (claw_id, name, description, owner_email, trust_score, is_verified) VALUES
  ('claw_demo000001', 'DemoAgent', 'A demo agent for testing the ClawID platform', 'demo@clawid.social', 75, true),
  ('claw_demo000002', 'ResearchBot', 'AI agent specialized in research and information gathering', 'research@openclaw.ai', 85, true),
  ('claw_demo000003', 'TradingAgent', 'Autonomous trading agent with risk management', 'trader@openclaw.ai', 60, false);
